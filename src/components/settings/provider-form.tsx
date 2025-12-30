"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import type { ProviderConfig } from "@/types/settings";

const predefinedProviders = [
  {
    name: "openai",
    label: "OpenAI",
    defaultEndpoint: "https://api.openai.com/v1",
  },
  {
    name: "anthropic",
    label: "Anthropic",
    defaultEndpoint: "https://api.anthropic.com",
  },
];

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
      apiKey: "",
      apiEndpoint: "",
      enabled: true,
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.apiKey) {
      return;
    }

    const provider: ProviderConfig = {
      name: formData.name,
      apiKey: formData.apiKey,
      apiEndpoint: formData.apiEndpoint || undefined,
      enabled: formData.enabled ?? true,
    };

    upsertProvider(provider);
    onClose?.();
  };

  const isPredefined = predefinedProviders.some(
    (p) => p.name === formData.name,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 提供商选择 */}
      <div className="space-y-2">
        <label
          htmlFor="provider-name"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          提供商
        </label>
        <select
          id="provider-name"
          value={formData.name}
          onChange={(e) => {
            const selected = predefinedProviders.find(
              (p) => p.name === e.target.value,
            );
            setFormData({
              ...formData,
              name: e.target.value,
              apiEndpoint: selected?.defaultEndpoint || "",
            });
          }}
          disabled={!!existingProvider}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors hover:border-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:border-zinc-600 dark:focus:border-blue-400"
        >
          <option value="">选择提供商</option>
          {predefinedProviders.map((provider) => (
            <option key={provider.name} value={provider.name}>
              {provider.label}
            </option>
          ))}
        </select>
      </div>

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
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors hover:border-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:border-zinc-600 dark:focus:border-blue-400"
          required
        />
      </div>

      {/* API Endpoint (可选) */}
      {(isPredefined || formData.apiEndpoint) && (
        <div className="space-y-2">
          <label
            htmlFor="api-endpoint"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            API Endpoint（可选）
          </label>
          <input
            type="url"
            value={formData.apiEndpoint || ""}
            onChange={(e) =>
              setFormData({ ...formData, apiEndpoint: e.target.value })
            }
            placeholder="https://api.example.com/v1"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors hover:border-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:border-zinc-600 dark:focus:border-blue-400"
          />
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
