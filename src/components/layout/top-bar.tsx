import { Tooltip } from "antd";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatusTone = "neutral" | "info" | "success" | "warning";

interface TopBarProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  status?: {
    label: string;
    tone?: StatusTone;
    icon?: ReactNode;
    tooltip?: string;
  };
  actions?: ReactNode;
}

const statusToneStyles: Record<StatusTone, string> = {
  neutral:
    "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
};

export function TopBar({
  title,
  subtitle,
  leading,
  status,
  actions,
}: TopBarProps) {
  const tone = status?.tone ?? "neutral";

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
            <Tooltip title={status.tooltip}>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                  statusToneStyles[tone],
                )}
              >
                {status.icon ? (
                  <span className="flex h-3.5 w-3.5 items-center justify-center">
                    {status.icon}
                  </span>
                ) : null}
                {status.label}
              </span>
            </Tooltip>
          ) : null}
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
