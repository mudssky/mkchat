"use client";

import { useState } from "react";
import { McpServerForm } from "@/components/settings/mcp-server-form";
import { SettingsSection } from "@/components/settings/settings-section";
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
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
            已连接
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
            错误
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            未连接
          </span>
        );
    }
  };

  return (
    <SettingsSection
      title="MCP 工具"
      description="管理 Model Context Protocol (MCP) 服务器连接"
    >
      {/* 添加按钮 */}
      {!showAddForm && (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <span className="text-lg">+</span>
          添加服务器
        </button>
      )}

      {/* 添加表单 */}
      {showAddForm && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            添加 MCP 服务器
          </h3>
          <McpServerForm onClose={() => setShowAddForm(false)} />
        </div>
      )}

      {/* 服务器列表 */}
      <div className="space-y-3">
        {mcpServers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              还没有配置任何 MCP 服务器，点击上方按钮添加
            </p>
          </div>
        ) : (
          mcpServers.map((server) => (
            <div
              key={server.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
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
              <div className="flex gap-2">
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
