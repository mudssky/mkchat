"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, Copy, PencilLine } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildMessageChain,
  getChildrenMap,
  getDefaultLeafFrom,
} from "@/lib/chat/message-tree";
import type { ChatMessage } from "@/types/chat";
import { BranchNavigator } from "./BranchNavigator";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  currentLeafId: string | null;
  assistantName?: string;
  suggestedPrompts?: string[];
  pendingUserMessageId?: string | null;
  streamingMessageId?: string | null;
  showThinkingIndicator?: boolean;
  stoppedMessageId?: string | null;
  onSelectLeaf: (leafId: string) => void;
  onEditMessage?: (message: ChatMessage, content: string) => void;
}

const DEFAULT_SUGGESTED_PROMPTS = [
  "帮我总结今天的会议要点。",
  "给我一个 7 天学习计划。",
  "帮我起草一封商务邮件。",
];

export function MessageList({
  messages,
  currentLeafId,
  assistantName,
  suggestedPrompts,
  pendingUserMessageId,
  streamingMessageId,
  showThinkingIndicator = false,
  stoppedMessageId,
  onSelectLeaf,
  onEditMessage,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chain = useMemo(() => {
    if (!currentLeafId) return [];
    return buildMessageChain(messages, currentLeafId);
  }, [messages, currentLeafId]);

  const childrenMap = useMemo(() => getChildrenMap(messages), [messages]);
  const totalContentLength = useMemo(
    () => chain.reduce((sum, message) => sum + message.content.length, 0),
    [chain],
  );
  const shouldVirtualize = chain.length > 80 || totalContentLength > 5000;
  const totalItems = chain.length + (showThinkingIndicator ? 1 : 0);

  const virtualizer = useVirtualizer({
    count: totalItems,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 6,
    getItemKey: (index) =>
      index === chain.length ? "thinking" : (chain[index]?.id ?? index),
  });
  const displayAssistant = assistantName?.trim() || "助手";
  const prompts =
    suggestedPrompts && suggestedPrompts.length > 0
      ? suggestedPrompts
      : DEFAULT_SUGGESTED_PROMPTS;

  const handleCopy = useCallback(async (message: ChatMessage) => {
    if (!message.content) return;
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }

    await navigator.clipboard.writeText(message.content);
    setCopiedId(message.id);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => {
      setCopiedId((current) => (current === message.id ? null : current));
    }, 1600);
  }, []);

  useEffect(() => {
    if (chain.length === 0) {
      return undefined;
    }

    const schedule =
      typeof requestAnimationFrame === "function"
        ? requestAnimationFrame
        : (callback: FrameRequestCallback) => window.setTimeout(callback, 16);
    const cancel =
      typeof cancelAnimationFrame === "function"
        ? cancelAnimationFrame
        : window.clearTimeout;

    const frame = schedule(() => {
      if (shouldVirtualize) {
        if (totalItems > 0) {
          virtualizer.scrollToIndex(totalItems - 1, { align: "end" });
        }
      } else {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    });
    return () => cancel(frame);
  }, [chain.length, shouldVirtualize, totalItems, virtualizer]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  if (chain.length === 0) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-200 bg-white/80 px-6 py-10 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            还没有消息，向 {displayAssistant} 发起对话吧。
          </div>
          <div className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-xs text-zinc-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              推荐起始问题
            </div>
            <ul className="space-y-2">
              {prompts.map((prompt) => (
                <li key={prompt} className="leading-5">
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const renderMessageItem = (message: ChatMessage, index: number) => {
    const children = childrenMap.get(message.id) ?? [];
    const activeChild = chain[index + 1];
    const shouldShowBranch = children.length > 1;
    const isUser = message.role === "user";
    const isEditing = editingId === message.id;
    const isLatestLeaf = index === chain.length - 1;
    const shouldShowActions = !isLatestLeaf;
    const canEdit = Boolean(onEditMessage) && isUser;

    const isPending = pendingUserMessageId === message.id;
    const isIncomplete =
      message.metadata?.incomplete ||
      message.metadata?.stopped ||
      stoppedMessageId === message.id;
    const isStreaming =
      streamingMessageId === message.id && message.role === "assistant";
    const statusLabel = isIncomplete
      ? "未完成"
      : isPending
        ? "发送中"
        : isStreaming
          ? "正在输入"
          : undefined;
    const statusTone = isIncomplete
      ? "warning"
      : isPending || isStreaming
        ? "info"
        : "neutral";
    const showCursor = isStreaming;

    return (
      <div key={message.id} className="group flex flex-col gap-2">
        <MessageBubble
          message={message}
          statusLabel={statusLabel}
          statusTone={statusTone}
          showCursor={showCursor}
        />
        {shouldShowActions ? (
          <div className={isUser ? "flex justify-end" : "flex justify-start"}>
            <div className="flex items-center gap-2 rounded-full border border-transparent bg-transparent px-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => {
                  if (!canEdit) return;
                  setEditingId(message.id);
                  setEditingContent(message.content);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:text-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200 dark:focus-visible:ring-blue-400/40"
                aria-label="编辑消息"
              >
                <PencilLine className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">编辑</span>
              </button>
              <button
                type="button"
                onClick={() => void handleCopy(message)}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200 dark:focus-visible:ring-blue-400/40"
                aria-label="复制消息"
              >
                {copiedId === message.id ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">复制</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}
        {isEditing ? (
          <div className={isUser ? "flex justify-end" : "flex justify-start"}>
            <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-3 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <textarea
                className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                rows={3}
                value={editingContent}
                onChange={(event) => setEditingContent(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    (event.ctrlKey || event.metaKey)
                  ) {
                    event.preventDefault();
                    if (!editingContent.trim()) return;
                    onEditMessage?.(message, editingContent.trim());
                    setEditingId(null);
                  }
                }}
                aria-label="编辑消息"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
                  onClick={() => setEditingId(null)}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-zinc-100 dark:text-zinc-900 dark:disabled:bg-zinc-700"
                  disabled={!editingContent.trim()}
                  onClick={() => {
                    if (!editingContent.trim()) return;
                    onEditMessage?.(message, editingContent.trim());
                    setEditingId(null);
                  }}
                >
                  提交
                </button>
              </div>
              <div className="mt-2 text-[11px] text-zinc-400">
                Ctrl + Enter 提交，创建新分支。
              </div>
            </div>
          </div>
        ) : null}
        {shouldShowBranch ? (
          <div className={isUser ? "flex justify-end" : "flex justify-start"}>
            <BranchNavigator
              parentMessageId={message.id}
              branches={children}
              activeChildId={activeChild?.id ?? null}
              onSelectChild={(childId) => {
                const leaf = getDefaultLeafFrom(messages, childId);
                onSelectLeaf(leaf?.id ?? childId);
              }}
            />
          </div>
        ) : null}
      </div>
    );
  };

  const thinkingIndicator = showThinkingIndicator ? (
    <div className="flex flex-col gap-2">
      <div className="flex justify-start">
        <div className="rounded-2xl bg-zinc-100 px-4 py-2 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
          思考中...
        </div>
      </div>
      <div className="flex justify-start">
        <div className="flex items-center gap-1 text-zinc-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-300" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-300" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-300" />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="flex flex-1 flex-col pb-6">
      <div ref={parentRef} className="flex-1 overflow-y-auto px-1">
        {shouldVirtualize ? (
          <div
            className="relative w-full"
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const index = virtualItem.index;
              const itemKey = virtualItem.key;
              const isThinkingItem =
                showThinkingIndicator && index === chain.length;
              const message = chain[index];

              return (
                <div
                  key={itemKey}
                  ref={virtualizer.measureElement}
                  data-index={index}
                  className="absolute left-0 top-0 w-full pb-6"
                  style={{ transform: `translateY(${virtualItem.start}px)` }}
                >
                  {isThinkingItem
                    ? thinkingIndicator
                    : message
                      ? renderMessageItem(message, index)
                      : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-6">
            {chain.map((message, index) => renderMessageItem(message, index))}
            {thinkingIndicator}
            <div ref={endRef} />
          </div>
        )}
      </div>
    </div>
  );
}
