"use client";

import { useState } from "react";
import { McpServerForm } from "@/components/settings/mcp-server-form";
import { SettingsSection } from "@/components/settings/settings-section";
import { StatusBadge } from "@/components/ui/status-badge";
import { useSettingsStore } from "@/store/settings-store";
import type { McpServerConfig } from "@/types/settings";

export default function McpSettingsPage() {
  const { mcpServers, removeMcpServer, updateMcpServerStatus } =
    useSettingsStore();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此 MCP 服务器吗？")) {
      removeMcpServer(id);
    }
  };

  const handleTestConnection = async (id: string, _url: string) => {
    try {
      updateMcpServerStatus(id, "connected");
      // TODO: 实现实际的连接测试
    } catch (_error) {
      updateMcpServerStatus(id, "error");
    }
  };

  const getStatusBadge = (status: McpServerConfig["status"]) => {
    switch (status) {
      case "connected":
        return <StatusBadge label="已连接" tone="success" size="xs" />;
      case "error":
        return <StatusBadge label="错误" tone="warning" size="xs" />;
      default:
        return <StatusBadge label="未连接" tone="neutral" size="xs" />;
    }
  };

  return (
    <SettingsSection
      title="MCP 工具"
      description="管理 Model Context Protocol (MCP) 服务器连接"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          已配置 {mcpServers.length} 个 MCP 服务器
        </div>
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span className="text-base">+</span>
            添加服务器
          </button>
        ) : null}
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
          <h3 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            添加 MCP 服务器
          </h3>
          <McpServerForm onClose={() => setShowAddForm(false)} />
        </div>
      )}

      {/* 服务器列表 */}
      <div className="space-y-3">
        {mcpServers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              还没有配置任何 MCP 服务器，点击上方按钮添加
            </p>
          </div>
        ) : (
          mcpServers.map((server) => (
            <div
              key={server.id}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                    {server.name}
                  </h3>
                  {getStatusBadge(server.status)}
                </div>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  URL:{" "}
                  <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                    {server.url}
                  </code>
                </p>
                {server.lastConnected && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    最后连接:{" "}
                    {new Date(server.lastConnected).toLocaleString("zh-CN")}
                  </p>
                )}
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleTestConnection(server.id, server.url)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  测试连接
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(server.id)}
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
