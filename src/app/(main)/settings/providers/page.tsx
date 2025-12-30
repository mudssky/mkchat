"use client";

import { useState } from "react";
import { ProviderForm } from "@/components/settings/provider-form";
import { SettingsSection } from "@/components/settings/settings-section";
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
      {/* 添加按钮 */}
      {!showAddForm && (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <span className="text-lg">+</span>
          添加提供商
        </button>
      )}

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
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
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              还没有配置任何提供商，点击上方按钮添加
            </p>
          </div>
        ) : (
          Object.entries(providers).map(([name, provider]) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                    {provider.name}
                  </h3>
                  {provider.enabled ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      已启用
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      已禁用
                    </span>
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
              <div className="flex gap-2">
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
