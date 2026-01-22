"use client";

import { TopBar } from "@/components/layout/top-bar";
import { TopBarActions } from "@/components/layout/top-bar-actions";
import { useSettingsStore } from "@/store/settings-store";

export function SettingsTopBar() {
  const providers = useSettingsStore((state) => state.providers);
  const mcpServers = useSettingsStore((state) => state.mcpServers);

  const providerCount = Object.values(providers).filter(
    (provider) => provider.apiKey.trim().length > 0,
  ).length;
  const mcpCount = mcpServers.length;

  const categories = 2;
  const done = (providerCount > 0 ? 1 : 0) + (mcpCount > 0 ? 1 : 0);
  const statusTone =
    done === 0 ? "warning" : done === categories ? "success" : "info";

  return (
    <TopBar
      title="设置"
      subtitle="管理应用的外观、模型与 MCP 配置"
      status={{
        label: `配置完成度：${done}/${categories}`,
        tone: statusTone,
        tooltip: `模型提供商：${providerCount}，MCP 服务器：${mcpCount}`,
      }}
      actions={<TopBarActions />}
    />
  );
}
