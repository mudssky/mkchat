"use client";

import { Home, MessagesSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "首页",
    href: "/",
    icon: Home,
  },
  {
    title: "会话列表",
    href: "/conversations",
    icon: MessagesSquare,
  },
  {
    title: "设置",
    href: "/settings/general",
    icon: Settings,
  },
];

interface AppShellProps {
  children: ReactNode;
}

/**
 * 应用壳层组件，负责统一侧边导航与移动端顶栏结构。
 * @param {AppShellProps} props - 组件属性。
 * @param {ReactNode} props.children - 页面内容。
 * @returns {JSX.Element} 应用壳层布局。
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-zinc-200 bg-white px-4 py-6 dark:border-zinc-800 dark:bg-zinc-900 md:flex">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
              AWA
            </div>
            <div>
              <div className="text-sm font-semibold">AI Agent</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Workbench
              </div>
            </div>
          </div>
          <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            导航
          </div>
          <nav className="mt-3 space-y-1">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            温暖/科技风格已启用
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
            <div className="text-sm font-semibold">AI Agent Workbench</div>
            <div className="flex items-center gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.title}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border text-zinc-500 transition",
                      active
                        ? "border-zinc-300 bg-zinc-100 text-zinc-900"
                        : "border-zinc-200 bg-white hover:border-zinc-300 hover:text-zinc-900",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
}
