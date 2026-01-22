import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/status-badge";

interface TopBarProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  status?: {
    label: string;
    tone?: "neutral" | "info" | "success" | "warning";
    icon?: ReactNode;
    tooltip?: string;
  };
  actions?: ReactNode;
}

/**
 * 页面顶部栏组件，用于展示标题、副标题、状态与快捷入口。
 * @param {TopBarProps} props - 组件属性。
 * @param {string} props.title - 主标题。
 * @param {string | undefined} props.subtitle - 副标题。
 * @param {ReactNode | undefined} props.leading - 左侧头像或图标。
 * @param {TopBarProps["status"] | undefined} props.status - 状态徽章配置。
 * @param {ReactNode | undefined} props.actions - 右侧操作区。
 * @returns {JSX.Element} 顶部栏组件。
 */
export function TopBar({
  title,
  subtitle,
  leading,
  status,
  actions,
}: TopBarProps) {
  return (
    <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {leading ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {leading}
            </div>
          ) : null}
          <div>
            <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </div>
            {subtitle ? (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {status ? (
            <StatusBadge
              label={status.label}
              tone={status.tone}
              icon={status.icon}
              tooltip={status.tooltip}
              size="sm"
            />
          ) : null}
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
