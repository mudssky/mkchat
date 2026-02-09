"use client";

import { ModuleSubNav } from "@/components/layout/module-sub-nav";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "通用设置",
    href: "/settings/general",
    icon: "⚙️",
    match: "exact" as const,
  },
  {
    title: "模型提供商",
    href: "/settings/providers",
    icon: "🤖",
    match: "prefix" as const,
  },
  {
    title: "MCP 工具",
    href: "/settings/mcp",
    icon: "🔌",
    match: "exact" as const,
  },
];

interface SettingsSidebarProps {
  className?: string;
}

export function SettingsSidebar({ className }: SettingsSidebarProps) {
  const items = navigationItems.map((item) => ({
    label: item.title,
    href: item.href,
    icon: item.icon,
    match: item.match,
  }));

  return (
    <aside
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      <ModuleSubNav items={items} />
    </aside>
  );
}
