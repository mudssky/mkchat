"use client";

import { useState } from "react";
import { ProviderForm } from "@/components/settings/provider-form";
import { SettingsSection } from "@/components/settings/settings-section";
import { StatusBadge } from "@/components/ui/status-badge";
import { useSettingsStore } from "@/store/settings-store";

export default function ProvidersSettingsPage() {
  const { providers, removeProvider } = useSettingsStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);

  const handleEdit = (providerName: string) => {
    setEditingProvider(providerName);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingProvider(null);
  };

  const handleDelete = (providerName: string) => {
    if (confirm(`确定要删除 ${providerName} 提供商吗？`)) {
      removeProvider(providerName);
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return "****";
    return `${key.slice(0, 4)}${"*".repeat(Math.min(key.length - 8, 20))}${key.slice(-4)}`;
  };

  return (
    <SettingsSection
      title="模型提供商"
      description="管理 AI 模型提供商的 API Key 和配置"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          已配置 {Object.keys(providers).length} 个提供商
        </div>
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span className="text-base">+</span>
            添加提供商
          </button>
        ) : null}
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
          <h3 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            {editingProvider ? "编辑提供商" : "添加新提供商"}
          </h3>
          <ProviderForm
            providerName={editingProvider || undefined}
            onClose={handleCloseForm}
          />
        </div>
      )}

      {/* 提供商列表 */}
      <div className="space-y-3">
        {Object.keys(providers).length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              还没有配置任何提供商，点击上方按钮添加
            </p>
          </div>
        ) : (
          Object.entries(providers).map(([name, provider]) => (
            <div
              key={name}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                    {provider.name}
                  </h3>
                  {provider.enabled ? (
                    <StatusBadge label="已启用" tone="success" size="xs" />
                  ) : (
                    <StatusBadge label="已禁用" tone="neutral" size="xs" />
                  )}
                </div>
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    API Key:{" "}
                    <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                      {maskApiKey(provider.apiKey)}
                    </code>
                  </p>
                  {provider.apiEndpoint && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Endpoint:{" "}
                      <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                        {provider.apiEndpoint}
                      </code>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleEdit(name)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(name)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </SettingsSection>
  );
}
