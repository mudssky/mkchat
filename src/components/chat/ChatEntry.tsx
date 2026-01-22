"use client";

import { useQuery } from "@tanstack/react-query";
import { Tooltip } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { assistantListResponseSchema } from "@/lib/chat/assistant-schema";
import type { AssistantSummary } from "@/types/chat";

interface CreateTopicResponse {
  topic: {
    id: string;
  };
}

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export function ChatEntry() {
  const router = useRouter();
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [errorByAssistant, setErrorByAssistant] = useState<
    Record<string, string>
  >({});
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["assistants"],
    queryFn: async () => {
      const response = await fetch("/api/assistants");
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const payload = await response.json();
      return assistantListResponseSchema.parse(payload);
    },
  });

  const assistants = useMemo<AssistantSummary[]>(
    () => data?.assistants ?? [],
    [data?.assistants],
  );
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredAssistants = useMemo(() => {
    if (!normalizedQuery) return assistants;
    return assistants.filter((assistant) => {
      const haystacks = [
        assistant.name,
        assistant.modelId,
        assistant.description ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystacks.includes(normalizedQuery);
    });
  }, [assistants, normalizedQuery]);

  const handleCreate = async (assistantId: string) => {
    if (creatingId) return;
    setCreatingId(assistantId);
    setErrorByAssistant((prev) => ({ ...prev, [assistantId]: "" }));

    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assistantId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        const apiMessage = payload?.error;
        const mappedMessage = apiMessage?.includes("provider")
          ? "助手未配置模型提供商。"
          : apiMessage?.includes("Assistant not found")
            ? "助手不存在，请刷新列表。"
            : (apiMessage ?? "创建会话失败，请稍后重试。");
        setErrorByAssistant((prev) => ({
          ...prev,
          [assistantId]: mappedMessage,
        }));
        return;
      }

      const payload = (await response.json()) as CreateTopicResponse;
      router.push(`/chat/${payload.topic.id}`);
    } finally {
      setCreatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm text-zinc-500">正在加载助手列表...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm text-zinc-600">加载失败：{error?.message}</div>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
        >
          重试
        </button>
      </div>
    );
  }

  if (assistants.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        暂无助手，请先完成配置。
        <Link
          href="/settings/providers"
          className="ml-2 font-semibold text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
        >
          去设置
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          选择助手并开始对话
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="搜索助手或模型"
          aria-label="搜索助手"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 sm:max-w-xs"
        />
      </div>

      {filteredAssistants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          未找到匹配的助手
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAssistants.map((assistant) => {
            const hasProvider = Boolean(assistant.providerConfigId);
            const isCreating = creatingId === assistant.id;
            const errorMessage = errorByAssistant[assistant.id];
            const assistantName = assistant.name.trim();
            const assistantInitial = assistantName ? assistantName[0] : "?";
            const assistantDescription =
              assistant.description?.trim() || "暂无描述";

            return (
              <div
                key={assistant.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {assistantInitial}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                          {assistant.name}
                        </div>
                        <Tooltip
                          title={
                            hasProvider
                              ? "已绑定模型提供商"
                              : "未绑定模型提供商，无法发起对话"
                          }
                        >
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                              hasProvider
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                                : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                            }`}
                          >
                            {hasProvider ? "模型可用" : "模型未配置"}
                          </span>
                        </Tooltip>
                        <Link
                          href={`/settings/assistants/${assistant.id}`}
                          className="text-xs font-semibold text-zinc-500 underline-offset-2 hover:text-zinc-700 hover:underline dark:text-zinc-300 dark:hover:text-zinc-100"
                        >
                          编辑助手
                        </Link>
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        模型：{assistant.modelId}
                      </div>
                      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {assistantDescription}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <button
                      type="button"
                      onClick={() => handleCreate(assistant.id)}
                      disabled={!hasProvider || isCreating}
                      className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-zinc-100 dark:text-zinc-900 dark:disabled:bg-zinc-700 dark:focus-visible:ring-blue-400/50"
                    >
                      {isCreating ? "正在创建..." : "新对话"}
                    </button>
                    {!hasProvider ? (
                      <div className="text-xs text-amber-600 dark:text-amber-300">
                        需要先配置 Provider
                      </div>
                    ) : null}
                  </div>
                </div>

                {errorMessage ? (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    历史对话
                  </div>
                  {assistant.topics.length === 0 ? (
                    <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                      暂无历史对话
                    </div>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {assistant.topics.map((topic) => (
                        <li key={topic.id}>
                          <Link
                            href={`/chat/${topic.id}`}
                            className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-700 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
                          >
                            <span>{topic.title?.trim() || "未命名对话"}</span>
                            <span className="text-[11px] text-zinc-400">
                              {formatTimestamp(topic.updatedAt)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
