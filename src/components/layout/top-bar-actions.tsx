import { MessagesSquare, Settings } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopBarActionsProps {
  className?: string;
}

const actionItems = [
  {
    label: "会话列表",
    href: "/conversations",
    icon: MessagesSquare,
  },
  {
    label: "设置",
    href: "/settings/general",
    icon: Settings,
  },
];

/**
 * 顶部栏快捷入口集合。
 * @param {TopBarActionsProps} props - 组件属性。
 * @param {string | undefined} props.className - 额外样式类名。
 * @returns {JSX.Element} 快捷入口组件。
 */
export function TopBarActions({ className }: TopBarActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {actionItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
