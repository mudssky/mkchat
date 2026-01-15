"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SettingsSection } from "@/components/settings/settings-section";
import { assistantDetailResponseSchema } from "@/lib/chat/assistant-schema";

interface AssistantFormState {
  name: string;
  modelId: string;
  systemPrompt: string;
}

export default function AssistantSettingsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const assistantId = useMemo(() => {
    if (!params?.id) return "";
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params?.id]);

  const [formState, setFormState] = useState<AssistantFormState>({
    name: "",
    modelId: "",
    systemPrompt: "",
  });
  const [initialized, setInitialized] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["assistant", assistantId],
    enabled: Boolean(assistantId),
    queryFn: async () => {
      const response = await fetch(`/api/assistants/${assistantId}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const payload = await response.json();
      return assistantDetailResponseSchema.parse(payload);
    },
  });

  useEffect(() => {
    if (!assistantId) {
      setInitialized(false);
      return;
    }
    setInitialized(false);
  }, [assistantId]);

  useEffect(() => {
    if (!data || initialized) return;
    const { assistant } = data;
    setFormState({
      name: assistant.name,
      modelId: assistant.modelId,
      systemPrompt: assistant.systemPrompt ?? "",
    });
    setInitialized(true);
  }, [data, initialized]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    const trimmedName = formState.name.trim();
    const trimmedModelId = formState.modelId.trim();
    if (!trimmedName || !trimmedModelId) {
      setSaveError("助手名称和模型不能为空。");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/assistants/${assistantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          modelId: trimmedModelId,
          systemPrompt: formState.systemPrompt,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setSaveError(payload?.error ?? "保存失败，请稍后重试。");
        return;
      }

      const payload = await response.json();
      const parsed = assistantDetailResponseSchema.parse(payload);
      setFormState({
        name: parsed.assistant.name,
        modelId: parsed.assistant.modelId,
        systemPrompt: parsed.assistant.systemPrompt ?? "",
      });
      setSaveSuccess(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (!assistantId) {
    return (
      <SettingsSection title="助手配置" description="缺少助手 ID">
        <div className="text-sm text-zinc-500">未找到助手 ID。</div>
      </SettingsSection>
    );
  }

  if (isLoading) {
    return (
      <SettingsSection title="助手配置" description="加载中">
        <div className="text-sm text-zinc-500">正在加载助手信息...</div>
      </SettingsSection>
    );
  }

  if (isError) {
    return (
      <SettingsSection title="助手配置" description="加载失败">
        <div className="text-sm text-zinc-600">加载失败：{error?.message}</div>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-3 rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
        >
          返回首页
        </button>
      </SettingsSection>
    );
  }

  const providerStatus = data?.assistant.providerConfigId
    ? `已绑定 (${data.assistant.providerConfigId})`
    : "未绑定";

  return (
    <SettingsSection
      title="助手配置"
      description="编辑助手的名称、模型与系统提示"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="assistant-name"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            名称
          </label>
          <input
            id="assistant-name"
            value={formState.name}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, name: event.target.value }))
            }
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="assistant-model"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            模型
          </label>
          <input
            id="assistant-model"
            value={formState.modelId}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, modelId: event.target.value }))
            }
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="assistant-prompt"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            系统提示
          </label>
          <textarea
            id="assistant-prompt"
            value={formState.systemPrompt}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                systemPrompt: event.target.value,
              }))
            }
            rows={6}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
          Provider 绑定状态：{providerStatus}
        </div>

        {saveError ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {saveError}
          </div>
        ) : null}

        {saveSuccess ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            已保存助手配置。
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-zinc-100 dark:text-zinc-900 dark:disabled:bg-zinc-700"
          >
            {isSaving ? "保存中..." : "保存更改"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500"
          >
            返回首页
          </button>
        </div>
      </form>
    </SettingsSection>
  );
}
