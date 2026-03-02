"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { CompareStreamState } from "@/hooks/use-compare-chat";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

interface CompareViewProps {
  /** Persisted compare messages from DB (used after streaming completes) */
  messages?: ChatMessage[];
  /** Live streaming states (used during active comparison) */
  streamStates?: CompareStreamState[];
  /** Called when user votes on a message */
  onVote?: (messageId: string, vote: "up" | "down" | null) => void;
  /** Called when user wants to continue conversation from a specific reply */
  onContinue?: (messageId: string) => void;
}

type ColumnStatus = "pending" | "streaming" | "completed" | "error" | "stopped";

interface ColumnData {
  id?: string;
  modelId: string;
  providerName: string;
  content: string;
  status: ColumnStatus;
  vote?: "up" | "down" | null;
  error?: string;
}

function StatusIndicator({ status }: { status: ColumnStatus }) {
  switch (status) {
    case "pending":
      return (
        <span className="text-xs text-zinc-400 animate-pulse">思考中...</span>
      );
    case "streaming":
      return (
        <span className="text-xs text-blue-500 animate-pulse">生成中...</span>
      );
    case "completed":
      return <span className="text-xs text-green-500">✓ 完成</span>;
    case "error":
      return <span className="text-xs text-red-500">✗ 错误</span>;
    case "stopped":
      return <span className="text-xs text-amber-500">已停止</span>;
    default:
      return null;
  }
}

function VoteButtons({
  vote,
  onVote,
}: {
  vote?: "up" | "down" | null;
  onVote: (v: "up" | "down" | null) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onVote(vote === "up" ? null : "up")}
        className={cn(
          "rounded-md p-1.5 transition",
          vote === "up"
            ? "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400"
            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
        )}
        aria-label="赞"
      >
        <ThumbsUp size={14} />
      </button>
      <button
        type="button"
        onClick={() => onVote(vote === "down" ? null : "down")}
        className={cn(
          "rounded-md p-1.5 transition",
          vote === "down"
            ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
        )}
        aria-label="踩"
      >
        <ThumbsDown size={14} />
      </button>
    </div>
  );
}

export function CompareView({
  messages,
  streamStates,
  onVote,
  onContinue,
}: CompareViewProps) {
  const [localVotes, setLocalVotes] = useState<
    Record<string, "up" | "down" | null>
  >({});

  const columns: ColumnData[] = useMemo(() => {
    // During streaming: use streamStates
    if (streamStates && streamStates.length > 0) {
      return streamStates.map((s) => ({
        id: s.messageId,
        modelId: s.modelId,
        providerName: s.providerName,
        content: s.content,
        status: s.status === "idle" ? "pending" : s.status,
        error: s.error,
      }));
    }
    // After streaming: use persisted messages
    if (messages && messages.length > 0) {
      return messages.map((m) => ({
        id: m.id,
        modelId: m.metadata?.compareModelId ?? "Unknown",
        providerName: m.metadata?.compareProviderName ?? "Unknown",
        content: m.content,
        status: "completed" as const,
        vote: (localVotes[m.id] !== undefined
          ? localVotes[m.id]
          : m.metadata?.vote) as "up" | "down" | null | undefined,
      }));
    }
    return [];
  }, [streamStates, messages, localVotes]);

  const handleVote = useCallback(
    (messageId: string | undefined, vote: "up" | "down" | null) => {
      if (!messageId) return;
      setLocalVotes((prev) => ({ ...prev, [messageId]: vote }));
      onVote?.(messageId, vote);
    },
    [onVote],
  );

  if (columns.length === 0) return null;

  return (
    <div
      className="grid gap-3 px-2 py-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      style={{
        gridTemplateColumns: `repeat(${Math.min(columns.length, 4)}, minmax(0, 1fr))`,
      }}
      data-testid="compare-view"
    >
      {columns.map((col, index) => (
        <div
          key={col.id ?? `stream-${index}`}
          className="flex flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        >
          {/* Header: model name + status */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {col.providerName}
              </span>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {col.modelId}
              </span>
            </div>
            <StatusIndicator status={col.status} />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-3 py-3 text-sm leading-6 text-zinc-800 dark:text-zinc-200">
            {col.error ? (
              <div className="text-red-500 text-xs">{col.error}</div>
            ) : col.content ? (
              <div className="flex items-end gap-1">
                <div className="prose prose-sm dark:prose-invert max-w-none min-w-0 flex-1">
                  <ReactMarkdown>{col.content}</ReactMarkdown>
                </div>
                {col.status === "streaming" && (
                  <span className="inline-block animate-pulse text-zinc-400">
                    ▍
                  </span>
                )}
              </div>
            ) : col.status === "pending" ? (
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-600" />
                等待响应...
              </div>
            ) : null}
          </div>

          {/* Footer: vote + continue */}
          {col.status === "completed" && col.id && (
            <div className="flex items-center justify-between border-t border-zinc-100 px-3 py-2 dark:border-zinc-800">
              <VoteButtons
                vote={col.vote}
                onVote={(v) => handleVote(col.id, v)}
              />
              {onContinue && (
                <button
                  type="button"
                  onClick={() => onContinue(col.id!)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                >
                  继续对话
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
