"use client";

import type { MenuProps } from "antd";
import { Dropdown } from "antd";
import { ChevronDown, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

interface BranchNavigatorProps {
  parentMessageId: string;
  branches: ChatMessage[];
  activeChildId: string | null;
  onSelectChild: (childId: string) => void;
}

const PREVIEW_LIMIT = 50;

function getPreview(content: string) {
  const trimmed = content.trim().replace(/\s+/g, " ");
  if (trimmed.length <= PREVIEW_LIMIT) return trimmed;
  return `${trimmed.slice(0, PREVIEW_LIMIT)}…`;
}

export function BranchNavigator({
  parentMessageId,
  branches,
  activeChildId,
  onSelectChild,
}: BranchNavigatorProps) {
  const selectedIndex = Math.max(
    0,
    branches.findIndex((branch) => branch.id === activeChildId),
  );

  const menuItems: MenuProps["items"] = branches.map((branch, index) => ({
    key: branch.id,
    label: (
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase text-zinc-400">
          分支 {index + 1}
        </span>
        <span className="text-sm text-zinc-700 dark:text-zinc-200">
          {getPreview(branch.content || "(空内容)")}
        </span>
      </div>
    ),
  }));

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomLeft"
      menu={{
        items: menuItems,
        selectable: true,
        selectedKeys: activeChildId ? [activeChildId] : [],
        onClick: (info) => onSelectChild(String(info.key)),
      }}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm transition hover:border-zinc-300 hover:text-zinc-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
          "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-500 dark:focus-visible:ring-blue-400/40",
        )}
        aria-label={`Branch selector for ${parentMessageId}`}
      >
        <GitBranch className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          分支 {selectedIndex + 1} / {branches.length}
        </span>
        <span className="sm:hidden text-[11px] text-zinc-500">
          {selectedIndex + 1}/{branches.length}
        </span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </Dropdown>
  );
}
