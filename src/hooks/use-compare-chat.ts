"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import type { CompareModelSelection } from "@/store/chat-store";

export type CompareStreamStatus =
  | "idle"
  | "pending"
  | "streaming"
  | "completed"
  | "error"
  | "stopped";

export interface CompareStreamState {
  assistantId: string;
  modelId: string;
  providerName: string;
  content: string;
  status: CompareStreamStatus;
  error?: string;
  messageId?: string;
}

export interface UseCompareChatOptions {
  topicId: string;
  onAllComplete?: () => void;
}

export interface UseCompareChatReturn {
  streams: CompareStreamState[];
  isComparing: boolean;
  sendCompare: (
    text: string,
    models: CompareModelSelection[],
    parentId: string | null,
  ) => Promise<void>;
  stopAll: () => void;
}

interface StreamCallbacks {
  onDelta: (text: string) => void;
  onMessageId: (id: string) => void;
  onParentId: (id: string) => void;
}

/**
 * Parse AI SDK UI Message Stream Protocol SSE events.
 * Extracts text deltas, assistant messageId, and parentId from start metadata.
 */
async function readStreamContent(
  response: Response,
  callbacks: StreamCallbacks,
  signal: AbortSignal,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No readable stream");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;

        try {
          const event = JSON.parse(data);
          if (event.type === "start") {
            if (event.messageId) callbacks.onMessageId(event.messageId);
            if (event.messageMetadata?.parentId) {
              callbacks.onParentId(event.messageMetadata.parentId);
            }
          }
          if (event.type === "text-delta" && typeof event.delta === "string") {
            callbacks.onDelta(event.delta);
          }
        } catch {
          // skip malformed JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function useCompareChat({
  topicId,
  onAllComplete,
}: UseCompareChatOptions): UseCompareChatReturn {
  const queryClient = useQueryClient();
  const [streams, setStreams] = useState<CompareStreamState[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const abortControllersRef = useRef<AbortController[]>([]);
  const onAllCompleteRef = useRef(onAllComplete);
  onAllCompleteRef.current = onAllComplete;

  const updateStream = useCallback(
    (index: number, patch: Partial<CompareStreamState>) => {
      setStreams((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
      );
    },
    [],
  );

  const stopAll = useCallback(() => {
    for (const controller of abortControllersRef.current) {
      controller.abort();
    }
    setStreams((prev) =>
      prev.map((s) =>
        s.status === "pending" || s.status === "streaming"
          ? { ...s, status: "stopped" as const }
          : s,
      ),
    );
    setIsComparing(false);
  }, []);

  const sendCompare = useCallback(
    async (
      text: string,
      models: CompareModelSelection[],
      parentId: string | null,
    ) => {
      if (models.length < 2) return;

      const compareGroupId = crypto.randomUUID();
      const controllers = models.map(() => new AbortController());
      abortControllersRef.current = controllers;

      setStreams(
        models.map((m) => ({
          assistantId: m.assistantId,
          modelId: m.modelId,
          providerName: m.providerName,
          content: "",
          status: "pending" as const,
        })),
      );
      setIsComparing(true);

      // Resolved when first request's SSE start event provides user message ID
      let resolveUserMsgId: (id: string) => void;
      const userMsgIdPromise = new Promise<string>((resolve) => {
        resolveUserMsgId = resolve;
      });

      let completedCount = 0;
      const totalCount = models.length;

      const onStreamDone = () => {
        completedCount++;
        if (completedCount >= totalCount) {
          setIsComparing(false);
          queryClient.invalidateQueries({ queryKey: ["topic", topicId] });
          onAllCompleteRef.current?.();
        }
      };

      const sendOne = async (index: number) => {
        const model = models[index];
        const controller = controllers[index];
        const isFirst = index === 0;

        const body: Record<string, unknown> = {
          topicId,
          assistantId: model.assistantId,
          message: text,
          parentId,
          compareGroupId,
          compareModelId: model.modelId,
          compareProviderName: model.providerName,
        };

        // Subsequent requests wait for user message ID from first request
        if (!isFirst) {
          const userMsgId = await Promise.race([
            userMsgIdPromise,
            new Promise<null>((resolve) => {
              const check = () => {
                if (controller.signal.aborted) resolve(null);
                else setTimeout(check, 50);
              };
              check();
            }),
          ]);
          if (!userMsgId || controller.signal.aborted) {
            onStreamDone();
            return;
          }
          body.compareParentId = userMsgId;
        }

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

          if (!response.ok) {
            const errText = await response.text();
            updateStream(index, { status: "error", error: errText });
            onStreamDone();
            return;
          }

          updateStream(index, { status: "streaming" });

          await readStreamContent(
            response,
            {
              onDelta: (delta) => {
                setStreams((prev) =>
                  prev.map((s, i) =>
                    i === index ? { ...s, content: s.content + delta } : s,
                  ),
                );
              },
              onMessageId: (messageId) => {
                updateStream(index, { messageId });
              },
              onParentId: (pid) => {
                // First request: parentId in metadata = user message ID
                if (isFirst) resolveUserMsgId(pid);
              },
            },
            controller.signal,
          );

          updateStream(index, { status: "completed" });
        } catch (err) {
          if (controller.signal.aborted) {
            updateStream(index, { status: "stopped" });
          } else {
            updateStream(index, {
              status: "error",
              error: err instanceof Error ? err.message : "Unknown error",
            });
          }
        } finally {
          onStreamDone();
        }
      };

      // Launch all requests in parallel
      // First request creates user message; others wait for its ID
      await Promise.all(models.map((_, i) => sendOne(i)));
    },
    [topicId, queryClient, updateStream],
  );

  return { streams, isComparing, sendCompare, stopAll };
}
