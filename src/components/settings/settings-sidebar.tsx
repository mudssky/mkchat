"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "通用设置",
    href: "/settings/general",
    icon: "⚙️",
  },
  {
    title: "模型提供商",
    href: "/settings/providers",
    icon: "🤖",
  },
  {
    title: "MCP 工具",
    href: "/settings/mcp",
    icon: "🔌",
  },
];

interface SettingsSidebarProps {
  className?: string;
}

export function SettingsSidebar({ className }: SettingsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-64 border-r border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950",
        className,
      )}
    >
      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50",
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
