"use client";

import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { useCompareChat } from "@/hooks/use-compare-chat";
import {
  CHAT_PERFORMANCE_EVENT,
  type ChatPerformanceMetric,
  measureChatPerformance,
} from "@/lib/chat/chat-performance";
import {
  buildMessageChain,
  findCompareGroup,
  getDefaultLeaf,
  isCompareGroup,
} from "@/lib/chat/message-tree";
import type { TopicResponse } from "@/lib/chat/topic-schema";
import { topicResponseSchema } from "@/lib/chat/topic-schema";
import { useChatStore } from "@/store/chat-store";
import type { ChatMessage, ChatMessageMetadata } from "@/types/chat";
import { CompareView } from "./CompareView";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

interface ChatContainerProps {
  topicId: string;
  assistantName?: string;
  initialTopic?: TopicResponse["topic"];
}

const metadataSchema: z.ZodType<ChatMessageMetadata> = z.object({
  topicId: z.string(),
  parentId: z.string().nullable(),
  createdAt: z.string(),
  incomplete: z.boolean().optional(),
  stopped: z.boolean().optional(),
});

type ChatUIMessage = UIMessage<ChatMessageMetadata>;

function extractText(parts: UIMessage["parts"]) {
  return parts
    .map((part) => {
      if (part.type === "text" || part.type === "reasoning") {
        return part.text;
      }
      return "";
    })
    .join("");
}

function uiMessageToChatMessage(
  message: ChatUIMessage,
  fallbackTopicId: string,
): ChatMessage {
  const metadata = message.metadata;

  return {
    id: message.id,
    topicId: metadata?.topicId ?? fallbackTopicId,
    content: extractText(message.parts),
    role: message.role,
    createdAt: metadata?.createdAt ?? new Date().toISOString(),
    parentId: metadata?.parentId ?? null,
    metadata: metadata
      ? {
          incomplete: metadata.incomplete,
          stopped: metadata.stopped,
        }
      : undefined,
  };
}

function arePathsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

interface ChatRequestMetadata {
  topicId: string;
  assistantId: string;
  parentId: string | null;
}

function buildPathFromLeaf(messages: ChatMessage[], leafId: string) {
  return measureChatPerformance(
    "message-chain-build",
    () => buildMessageChain(messages, leafId).map((message) => message.id),
    { messageCount: messages.length },
  );
}

export function ChatContainer({
  topicId,
  assistantName,
  initialTopic,
}: ChatContainerProps) {
  const queryClient = useQueryClient();
  const [timeoutError, setTimeoutError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [stoppedMessageId, setStoppedMessageId] = useState<string | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<
    ChatPerformanceMetric[]
  >([]);
  const lastSentContentRef = useRef<string | null>(null);
  const lastSyncedDataAtRef = useRef(0);
  const pendingUserMessageIdRef = useRef<string | null>(null);
  const lastAssistantContentRef = useRef<string>("");
  const lastActivityAtRef = useRef<number | null>(null);

  const { data, dataUpdatedAt, isLoading, isError, error, refetch } = useQuery<
    TopicResponse,
    Error
  >({
    queryKey: ["topic", topicId],
    queryFn: async () => {
      const response = await fetch(`/api/topics/${topicId}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const payload = await response.json();
      return topicResponseSchema.parse(payload);
    },
    initialData: initialTopic ? { topic: initialTopic } : undefined,
    initialDataUpdatedAt: initialTopic ? Date.now() : undefined,
    staleTime: initialTopic ? 30_000 : 0,
  });

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: (options) => {
          const requestMetadata =
            (options.requestMetadata as ChatRequestMetadata | undefined) ??
            undefined;

          const baseBody = {
            ...(options.body ?? {}),
            id: options.id,
            messages: options.messages,
            trigger: options.trigger,
            messageId: options.messageId,
          };

          if (!requestMetadata) {
            return {
              body: baseBody,
            };
          }

          return {
            body: {
              ...baseBody,
              topicId: requestMetadata.topicId,
              assistantId: requestMetadata.assistantId,
              parentId: requestMetadata.parentId,
            },
          };
        },
      }),
    [],
  );

  const {
    messages: uiMessages,
    sendMessage,
    status,
    error: chatError,
    stop,
    regenerate,
    setMessages,
  } = useChat<ChatUIMessage>({
    id: topicId,
    transport,
    messageMetadataSchema: metadataSchema,
    experimental_throttle: 50,
    onFinish: () => {
      lastSentContentRef.current = null;
      setConnectionError(null);
      setTimeoutError(null);
      queryClient.invalidateQueries({ queryKey: ["topic", topicId] });
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : "";
      const isNetworkError = /network|fetch|abort|timeout/i.test(
        errorMessage.toLowerCase(),
      );
      setConnectionError(
        isNetworkError ? "连接中断，请检查网络后重试。" : null,
      );
      if (lastSentContentRef.current) {
        updateDraft(lastSentContentRef.current);
      }
      if (pendingUserMessageIdRef.current) {
        setMessages((messages) =>
          messages.filter((msg) => msg.id !== pendingUserMessageIdRef.current),
        );
      }
      queryClient.invalidateQueries({ queryKey: ["topic", topicId] });
    },
  });

  const currentBranchPath = useChatStore((state) => state.currentBranchPath);
  const setCurrentBranch = useChatStore((state) => state.setCurrentBranch);
  const inputDraft = useChatStore((state) => state.inputDraft);
  const updateDraft = useChatStore((state) => state.updateDraft);
  const compareModels = useChatStore((state) => state.compareModels);
  const setCompareModels = useChatStore((state) => state.setCompareModels);
  const clearCompareModels = useChatStore((state) => state.clearCompareModels);

  const {
    streams: compareStreams,
    isComparing,
    sendCompare,
    stopAll: stopCompare,
  } = useCompareChat({
    topicId,
    onAllComplete: () => {
      clearCompareModels();
    },
  });

  const baseMessages = useMemo(() => {
    const topicMessages = data?.topic.messages ?? [];
    return topicMessages.map((message) => ({
      id: message.id,
      role: message.role === "tool" ? "assistant" : message.role,
      parts: [{ type: "text" as const, text: message.content }],
      metadata: {
        topicId: message.topicId,
        parentId: message.parentId,
        createdAt: message.createdAt,
        incomplete: message.metadata?.incomplete,
        stopped: message.metadata?.stopped,
      },
    }));
  }, [data?.topic.messages]);

  // 仅在 Query 数据版本更新后回写，避免流式完成瞬间被旧缓存覆盖。
  useEffect(() => {
    if (status === "streaming" || status === "submitted") return;
    if (!data || dataUpdatedAt <= lastSyncedDataAtRef.current) return;

    setMessages(baseMessages);
    lastSyncedDataAtRef.current = dataUpdatedAt;
  }, [baseMessages, data, dataUpdatedAt, setMessages, status]);

  const displayMessages = useMemo(
    () =>
      measureChatPerformance(
        "ui-message-normalize",
        () =>
          uiMessages.map((message) => uiMessageToChatMessage(message, topicId)),
        { messageCount: uiMessages.length },
      ),
    [topicId, uiMessages],
  );

  useEffect(() => {
    if (displayMessages.length === 0) {
      if (currentBranchPath.length > 0) {
        setCurrentBranch([]);
      }
      return;
    }

    const currentLeafId = currentBranchPath[currentBranchPath.length - 1];
    const leafExists = currentLeafId
      ? displayMessages.some((message) => message.id === currentLeafId)
      : false;

    if (!leafExists) {
      const defaultLeaf = getDefaultLeaf(displayMessages);
      const nextPath = defaultLeaf
        ? buildPathFromLeaf(displayMessages, defaultLeaf.id)
        : [];
      if (!arePathsEqual(currentBranchPath, nextPath)) {
        setCurrentBranch(nextPath);
      }
    }
  }, [currentBranchPath, displayMessages, setCurrentBranch]);

  useEffect(() => {
    if (status !== "submitted" && status !== "streaming") return;
    const lastMessage = displayMessages[displayMessages.length - 1];
    if (!lastMessage) return;
    const nextPath = buildPathFromLeaf(displayMessages, lastMessage.id);
    if (!arePathsEqual(currentBranchPath, nextPath)) {
      setCurrentBranch(nextPath);
    }
  }, [currentBranchPath, displayMessages, setCurrentBranch, status]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return undefined;

    const handleMetric = (event: Event) => {
      const customEvent = event as CustomEvent<ChatPerformanceMetric>;
      if (!customEvent.detail) return;
      setPerformanceMetrics((previous) =>
        [customEvent.detail, ...previous].slice(0, 5),
      );
    };

    window.addEventListener(CHAT_PERFORMANCE_EVENT, handleMetric);
    return () => {
      window.removeEventListener(CHAT_PERFORMANCE_EVENT, handleMetric);
    };
  }, []);

  useEffect(() => {
    if (status === "submitted") {
      const lastUser = [...uiMessages]
        .reverse()
        .find((msg) => msg.role === "user");
      if (lastUser) {
        pendingUserMessageIdRef.current = lastUser.id;
        lastActivityAtRef.current = Date.now();
      }
    }
  }, [status, uiMessages]);

  useEffect(() => {
    if (status === "submitted" || status === "streaming") return;
    pendingUserMessageIdRef.current = null;
    lastAssistantContentRef.current = "";
    lastActivityAtRef.current = null;
  }, [status]);

  useEffect(() => {
    if (status !== "streaming") return;
    const lastAssistant = [...uiMessages]
      .reverse()
      .find((msg) => msg.role === "assistant");
    if (!lastAssistant) return;
    const content = extractText(lastAssistant.parts);
    if (content !== lastAssistantContentRef.current) {
      lastAssistantContentRef.current = content;
      lastActivityAtRef.current = Date.now();
    }
  }, [status, uiMessages]);

  useEffect(() => {
    if (!stoppedMessageId) return;
    const hasPersisted = data?.topic.messages.some(
      (message) =>
        message.id === stoppedMessageId && message.metadata?.incomplete,
    );
    if (hasPersisted) {
      setStoppedMessageId(null);
    }
  }, [data?.topic.messages, stoppedMessageId]);

  const handleStop = useCallback(
    (reason?: "timeout") => {
      const lastAssistant = [...displayMessages]
        .reverse()
        .find((msg) => msg.role === "assistant");
      if (lastAssistant) {
        setStoppedMessageId(lastAssistant.id);
      }
      stop();
      if (reason === "timeout") {
        setTimeoutError("响应超时，已停止生成。");
      }
    },
    [displayMessages, stop],
  );

  useEffect(() => {
    if (status !== "submitted" && status !== "streaming") {
      setTimeoutError(null);
      setConnectionError(null);
      return undefined;
    }

    const interval = window.setInterval(() => {
      if (!lastActivityAtRef.current) return;
      if (Date.now() - lastActivityAtRef.current > 30000) {
        handleStop("timeout");
        lastActivityAtRef.current = Date.now();
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [handleStop, status]);

  const currentLeafId =
    currentBranchPath.length > 0
      ? currentBranchPath[currentBranchPath.length - 1]
      : (getDefaultLeaf(displayMessages)?.id ?? null);

  const handleSelectLeaf = useCallback(
    (leafId: string) => {
      const chain = buildMessageChain(displayMessages, leafId).map(
        (message) => message.id,
      );
      setCurrentBranch(chain);
    },
    [displayMessages, setCurrentBranch],
  );

  const handleSend = useCallback(
    async (content: string) => {
      if (!data?.topic) return;
      lastSentContentRef.current = content;
      setConnectionError(null);
      setTimeoutError(null);

      const metadata: ChatMessageMetadata = {
        topicId: data.topic.id,
        parentId: currentLeafId,
        createdAt: new Date().toISOString(),
      };

      await sendMessage(
        { text: content, metadata },
        {
          metadata: {
            topicId: data.topic.id,
            assistantId: data.topic.assistantId,
            parentId: currentLeafId,
          } satisfies ChatRequestMetadata,
        },
      );
    },
    [currentLeafId, data?.topic, sendMessage],
  );

  const handleEdit = useCallback(
    async (message: ChatMessage, content: string) => {
      if (!data?.topic) return;
      lastSentContentRef.current = content;
      setConnectionError(null);
      setTimeoutError(null);

      const metadata: ChatMessageMetadata = {
        topicId: data.topic.id,
        parentId: message.parentId,
        createdAt: new Date().toISOString(),
      };

      await sendMessage(
        { text: content, metadata },
        {
          metadata: {
            topicId: data.topic.id,
            assistantId: data.topic.assistantId,
            parentId: message.parentId,
          } satisfies ChatRequestMetadata,
        },
      );
    },
    [data?.topic, sendMessage],
  );

  const handleRegenerate = useCallback(async () => {
    if (!data?.topic) {
      await regenerate();
      return;
    }

    await regenerate({
      metadata: {
        topicId: data.topic.id,
        assistantId: data.topic.assistantId,
        parentId: currentLeafId,
      } satisfies ChatRequestMetadata,
    });
  }, [currentLeafId, data?.topic, regenerate]);

  const handleCompareSend = useCallback(
    async (content: string) => {
      if (!data?.topic || compareModels.length < 2) return;
      lastSentContentRef.current = content;
      setConnectionError(null);
      setTimeoutError(null);
      await sendCompare(content, compareModels, currentLeafId);
    },
    [compareModels, currentLeafId, data?.topic, sendCompare],
  );

  const handleVote = useCallback(
    async (messageId: string, vote: "up" | "down" | null) => {
      try {
        await fetch(`/api/messages/${messageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metadata: { vote: vote ?? null },
          }),
        });
      } catch {
        // silently fail vote
      }
    },
    [],
  );

  const handleContinueFromCompare = useCallback(
    (messageId: string) => {
      const chain = buildMessageChain(displayMessages, messageId).map(
        (m) => m.id,
      );
      setCurrentBranch(chain);
    },
    [displayMessages, setCurrentBranch],
  );

  // Detect compare group at the current leaf
  const compareGroupMessages = useMemo(() => {
    if (!currentLeafId || displayMessages.length === 0) return null;
    const currentMsg = displayMessages.find((m) => m.id === currentLeafId);
    if (!currentMsg?.parentId) return null;
    if (!isCompareGroup(displayMessages, currentMsg.parentId)) return null;
    return findCompareGroup(
      displayMessages,
      currentMsg.metadata?.compareGroupId ?? "",
    );
  }, [currentLeafId, displayMessages]);

  const isBusy =
    status === "submitted" || status === "streaming" || isComparing;
  const pendingUserMessageId =
    status === "submitted"
      ? ([...displayMessages].reverse().find((msg) => msg.role === "user")
          ?.id ?? null)
      : null;
  const streamingMessageId =
    status === "streaming"
      ? ([...displayMessages].reverse().find((msg) => msg.role === "assistant")
          ?.id ?? null)
      : null;
  const showThinkingIndicator = status === "submitted";

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
          正在加载对话...
        </div>
      ) : null}

      {isError ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            <div className="mb-3">加载失败：{error?.message}</div>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
            >
              重试加载
            </button>
          </div>
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <div className="flex flex-1 flex-col bg-zinc-50/40 dark:bg-zinc-950/30">
          <div className="flex-1 px-1 sm:px-2">
            <MessageList
              messages={displayMessages}
              currentLeafId={currentLeafId}
              assistantName={assistantName}
              pendingUserMessageId={pendingUserMessageId}
              streamingMessageId={streamingMessageId}
              showThinkingIndicator={showThinkingIndicator}
              stoppedMessageId={stoppedMessageId}
              onSelectLeaf={handleSelectLeaf}
              onEditMessage={handleEdit}
            />

            {/* Compare view: show during streaming or when viewing persisted compare group */}
            {isComparing && compareStreams.length > 0 ? (
              <CompareView
                streamStates={compareStreams}
                onVote={handleVote}
                onContinue={handleContinueFromCompare}
              />
            ) : compareGroupMessages && compareGroupMessages.length > 1 ? (
              <CompareView
                messages={compareGroupMessages}
                onVote={handleVote}
                onContinue={handleContinueFromCompare}
              />
            ) : null}
          </div>

          <div className="sticky bottom-0 border-t border-zinc-200 bg-white/95 px-3 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:px-4">
            <div className="flex w-full flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                <span>
                  {isComparing
                    ? "对比模式 · 多模型并行生成中…"
                    : isBusy
                      ? "模型正在生成，请稍候…"
                      : "已就绪，可继续提问"}
                </span>
                <span>Ctrl / Cmd + Enter 发送</span>
              </div>

              {connectionError || chatError ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                  <span>{connectionError ?? chatError?.message}</span>
                  <button
                    type="button"
                    onClick={() => void handleRegenerate()}
                    className="touch-manipulation rounded-md px-2 py-1 text-xs font-semibold text-red-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:text-red-200 dark:focus-visible:ring-red-400/40"
                    tabIndex={0}
                    aria-label="重试生成"
                  >
                    重试生成
                  </button>
                </div>
              ) : null}

              {timeoutError ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  {timeoutError}
                </div>
              ) : null}

              <MessageInput
                value={inputDraft}
                onChange={updateDraft}
                onSend={handleSend}
                disabled={isBusy}
                compareModels={compareModels}
                onCompareModelsChange={setCompareModels}
                onCompareSend={handleCompareSend}
              />

              <div className="flex min-h-5 items-center gap-3">
                {isBusy ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (isComparing) {
                        stopCompare();
                      } else {
                        handleStop();
                      }
                    }}
                    className="touch-manipulation rounded-md px-2 py-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:text-zinc-400 dark:hover:text-zinc-100 dark:focus-visible:ring-blue-400/40"
                    tabIndex={0}
                    aria-label={isComparing ? "停止全部" : "停止生成"}
                  >
                    {isComparing ? "停止全部" : "停止生成"}
                  </button>
                ) : null}
                {isBusy ? (
                  <div className="text-[11px] text-zinc-400">
                    请等待当前响应完成
                  </div>
                ) : null}
              </div>

              {process.env.NODE_ENV === "development" &&
              performanceMetrics.length > 0 ? (
                <div
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  aria-live="polite"
                >
                  <div className="mb-1 font-semibold text-zinc-600 dark:text-zinc-300">
                    性能监控（最近 5 条）
                  </div>
                  <ul className="space-y-1">
                    {performanceMetrics.map((metric, index) => (
                      <li key={`${metric.name}-${index}`}>
                        {metric.name}: {metric.durationMs.toFixed(2)}ms
                        {typeof metric.messageCount === "number"
                          ? ` · messages=${metric.messageCount}`
                          : ""}
                        {typeof metric.virtualized === "boolean"
                          ? ` · virtualized=${metric.virtualized ? "yes" : "no"}`
                          : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
