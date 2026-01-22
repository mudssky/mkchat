import { Tooltip } from "antd";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatusTone = "neutral" | "info" | "success" | "warning";

type StatusSize = "sm" | "xs";

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  icon?: ReactNode;
  tooltip?: string;
  size?: StatusSize;
  className?: string;
}

const toneStyles: Record<StatusTone, string> = {
  neutral:
    "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
};

const sizeStyles: Record<StatusSize, string> = {
  sm: "px-3 py-1 text-xs",
  xs: "px-2 py-0.5 text-[11px]",
};

/**
 * 状态徽章组件，支持色调、图标与提示文案。
 * @param {StatusBadgeProps} props - 组件属性。
 * @param {string} props.label - 徽章文案。
 * @param {StatusTone | undefined} props.tone - 徽章色调。
 * @param {ReactNode | undefined} props.icon - 前置图标。
 * @param {string | undefined} props.tooltip - 提示文案。
 * @param {StatusSize | undefined} props.size - 尺寸规格。
 * @param {string | undefined} props.className - 额外样式类名。
 * @returns {JSX.Element} 状态徽章。
 */
export function StatusBadge({
  label,
  tone = "neutral",
  icon,
  tooltip,
  size = "sm",
  className,
}: StatusBadgeProps) {
  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        toneStyles[tone],
        sizeStyles[size],
        className,
      )}
    >
      {icon ? (
        <span className="flex h-3.5 w-3.5 items-center justify-center">
          {icon}
        </span>
      ) : null}
      {label}
    </span>
  );

  if (!tooltip) {
    return badge;
  }

  return <Tooltip title={tooltip}>{badge}</Tooltip>;
}
