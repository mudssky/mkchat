"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import type { ProviderConfig, ProviderType } from "@/types/settings";

const predefinedProviders: {
  name: string;
  type: ProviderType;
  label: string;
  defaultEndpoint: string;
}[] = [
  {
    name: "openai",
    type: "openai",
    label: "OpenAI",
    defaultEndpoint: "https://api.openai.com/v1",
  },
  {
    name: "anthropic",
    type: "anthropic",
    label: "Anthropic",
    defaultEndpoint: "https://api.anthropic.com",
  },
  {
    name: "openai-compatible",
    type: "openai-compatible",
    label: "OpenAI 兼容",
    defaultEndpoint: "",
  },
];

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors hover:border-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:border-zinc-600 dark:focus:border-blue-400";

interface ProviderFormProps {
  providerName?: string;
  onClose?: () => void;
}

export function ProviderForm({ providerName, onClose }: ProviderFormProps) {
  const { providers, upsertProvider } = useSettingsStore();
  const existingProvider = providerName ? providers[providerName] : undefined;

  const [formData, setFormData] = useState<Partial<ProviderConfig>>(
    existingProvider || {
      name: "",
      type: "openai",
      apiKey: "",
      apiEndpoint: "",
      enabled: true,
      displayName: "",
      models: [],
    },
  );

  // 自定义模型 ID 输入（逗号分隔文本）
  const [modelInput, setModelInput] = useState(
    existingProvider?.models?.join(", ") ?? "",
  );

  const isOpenAICompatible = formData.type === "openai-compatible";

  const handleProviderSelect = (value: string) => {
    const selected = predefinedProviders.find((p) => p.name === value);
    if (selected) {
      setFormData({
        ...formData,
        name: selected.name,
        type: selected.type,
        apiEndpoint: selected.defaultEndpoint,
        displayName: selected.type === "openai-compatible" ? "" : undefined,
      });
      if (selected.type !== "openai-compatible") {
        setModelInput("");
      }
    } else {
      setFormData({
        ...formData,
        name: value,
        type: "openai",
        apiEndpoint: "",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.apiKey) return;

    // openai-compatible 需要 displayName 和 apiEndpoint
    if (isOpenAICompatible) {
      if (!formData.displayName?.trim() || !formData.apiEndpoint?.trim()) {
        return;
      }
    }

    if (!formData.name) return;

    // 解析模型列表
    const models = isOpenAICompatible
      ? modelInput
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean)
      : formData.models;

    // openai-compatible 使用 displayName 作为存储 key
    const providerKey = isOpenAICompatible
      ? (formData.displayName?.trim() ?? formData.name)
      : formData.name;

    const provider: ProviderConfig = {
      name: providerKey,
      type: formData.type ?? "openai",
      apiKey: formData.apiKey,
      apiEndpoint: formData.apiEndpoint || undefined,
      enabled: formData.enabled ?? true,
      displayName: isOpenAICompatible
        ? (formData.displayName?.trim() ?? undefined)
        : undefined,
      models: models?.length ? models : undefined,
    };

    upsertProvider(provider);
    onClose?.();
  };

  const showEndpoint =
    isOpenAICompatible ||
    predefinedProviders.some((p) => p.name === formData.name) ||
    !!formData.apiEndpoint;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 提供商类型选择 */}
      <div className="space-y-2">
        <label
          htmlFor="provider-name"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          提供商类型
        </label>
        <select
          id="provider-name"
          value={formData.name}
          onChange={(e) => handleProviderSelect(e.target.value)}
          disabled={!!existingProvider}
          className={`${inputClass} disabled:opacity-50`}
        >
          <option value="">选择提供商</option>
          {predefinedProviders.map((provider) => (
            <option key={provider.name} value={provider.name}>
              {provider.label}
            </option>
          ))}
        </select>
      </div>

      {/* 自定义显示名称 (openai-compatible 专用) */}
      {isOpenAICompatible && (
        <div className="space-y-2">
          <label
            htmlFor="display-name"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            显示名称 <span className="text-red-500">*</span>
          </label>
          <input
            id="display-name"
            type="text"
            value={formData.displayName ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, displayName: e.target.value })
            }
            placeholder="例如：DeepSeek、Groq、Ollama"
            className={inputClass}
            required
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            用于在列表中标识此提供商
          </p>
        </div>
      )}

      {/* API Key */}
      <div className="space-y-2">
        <label
          htmlFor="api-key"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          API Key
        </label>
        <input
          id="api-key"
          type="password"
          value={formData.apiKey}
          onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
          placeholder="sk-..."
          className={inputClass}
          required
        />
      </div>

      {/* API Endpoint */}
      {showEndpoint && (
        <div className="space-y-2">
          <label
            htmlFor="api-endpoint"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            API Endpoint
            {isOpenAICompatible ? (
              <span className="text-red-500"> *</span>
            ) : (
              "（可选）"
            )}
          </label>
          <input
            id="api-endpoint"
            type="url"
            value={formData.apiEndpoint || ""}
            onChange={(e) =>
              setFormData({ ...formData, apiEndpoint: e.target.value })
            }
            placeholder="https://api.example.com/v1"
            className={inputClass}
            required={isOpenAICompatible}
          />
          {isOpenAICompatible && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              OpenAI 兼容服务的 API 地址，通常以 /v1 结尾
            </p>
          )}
        </div>
      )}

      {/* 自定义模型 ID (openai-compatible 专用) */}
      {isOpenAICompatible && (
        <div className="space-y-2">
          <label
            htmlFor="model-ids"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            模型 ID
          </label>
          <input
            id="model-ids"
            type="text"
            value={modelInput}
            onChange={(e) => setModelInput(e.target.value)}
            placeholder="deepseek-chat, deepseek-coder（逗号分隔）"
            className={inputClass}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            输入该服务支持的模型 ID，多个用逗号分隔
          </p>
        </div>
      )}

      {/* 启用开关 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enabled"
          checked={formData.enabled ?? true}
          onChange={(e) =>
            setFormData({ ...formData, enabled: e.target.checked })
          }
          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
        />
        <label
          htmlFor="enabled"
          className="text-sm text-zinc-900 dark:text-zinc-50"
        >
          启用此提供商
        </label>
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-end gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            取消
          </button>
        )}
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {existingProvider ? "更新" : "添加"}
        </button>
      </div>
    </form>
  );
}
