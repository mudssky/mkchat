"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import type { McpServerConfig } from "@/types/settings";

interface McpServerFormProps {
  onClose?: () => void;
}

export function McpServerForm({ onClose }: McpServerFormProps) {
  const { addMcpServer } = useSettingsStore();
  const [formData, setFormData] = useState({
    name: "",
    url: "",
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(
    null,
  );

  const handleTestConnection = async () => {
    if (!formData.url) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      // 这里应该调用实际的 MCP 连接测试
      // 目前先模拟测试
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTestResult("success");
    } catch {
      setTestResult("error");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.url) {
      return;
    }

    const server: Omit<McpServerConfig, "id"> = {
      name: formData.name,
      url: formData.url,
      status: "disconnected",
    };

    addMcpServer(server);
    setFormData({ name: "", url: "" });
    setTestResult(null);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 服务器名称 */}
      <div className="space-y-2">
        <label
          htmlFor="server-name"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          服务器名称
        </label>
        <input
          id="server-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="例如: 本地文件服务器"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors hover:border-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:border-zinc-600 dark:focus:border-blue-400"
          required
        />
      </div>

      {/* SSE URL */}
      <div className="space-y-2">
        <label
          htmlFor="sse-url"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          SSE 端点 URL
        </label>
        <input
          id="sse-url"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="http://localhost:3000/api/sse"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors hover:border-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:border-zinc-600 dark:focus:border-blue-400"
          required
        />
      </div>

      {/* 测试连接按钮 */}
      {formData.url && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {isTesting ? "测试中..." : "测试连接"}
          </button>
          {testResult === "success" && (
            <span className="text-sm text-green-600 dark:text-green-400">
              ✓ 连接成功
            </span>
          )}
          {testResult === "error" && (
            <span className="text-sm text-red-600 dark:text-red-400">
              ✗ 连接失败
            </span>
          )}
        </div>
      )}

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
          添加服务器
        </button>
      </div>
    </form>
  );
}
