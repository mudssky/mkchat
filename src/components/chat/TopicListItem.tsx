"use client";

import { Pin } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import type { TopicItem } from "@/hooks/use-topics";

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

interface TopicListItemProps {
  topic: TopicItem;
  isArchiveView?: boolean;
  onRename: (topicId: string, newTitle: string) => void;
  onPin: (topicId: string, pinned: boolean) => void;
  onArchive: (topicId: string) => void;
  onUnarchive: (topicId: string) => void;
  onDelete: (topicId: string) => void;
  isRenaming: boolean;
  onStartRename: (topicId: string) => void;
  onCancelRename: () => void;
}

export function TopicListItem({
  topic,
  isArchiveView = false,
  onRename,
  onPin,
  onArchive,
  onUnarchive,
  onDelete,
  isRenaming,
  onStartRename,
  onCancelRename,
}: TopicListItemProps) {
  const [editTitle, setEditTitle] = useState(topic.title ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRenameConfirm = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== (topic.title ?? "")) {
      onRename(topic.id, trimmed);
    } else {
      onCancelRename();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRenameConfirm();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditTitle(topic.title ?? "");
      onCancelRename();
    }
  };

  const handleStartRename = () => {
    setEditTitle(topic.title ?? "");
    onStartRename(topic.id);
    // Focus after render
    setTimeout(() => inputRef.current?.select(), 0);
  };

  return (
    <div className="group flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5 transition hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-600">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {topic.pinned && (
          <Pin className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
        )}
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleRenameConfirm}
            onKeyDown={handleKeyDown}
            className="min-w-0 flex-1 rounded border border-blue-400 bg-white px-1.5 py-0.5 text-xs text-zinc-900 outline-none dark:bg-zinc-900 dark:text-zinc-100"
          />
        ) : (
          <Link
            href={`/chat/${topic.id}`}
            className="min-w-0 flex-1 truncate text-xs text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            {topic.title?.trim() || "未命名对话"}
          </Link>
        )}
      </div>

      <div className="ml-2 flex flex-shrink-0 items-center gap-1.5">
        <span className="text-[11px] text-zinc-400">
          {topic.assistant.name}
        </span>
        <span className="text-[11px] text-zinc-400">
          {formatTimestamp(topic.updatedAt)}
        </span>

        {/* Action menu - visible on hover */}
        <div className="relative">
          <TopicDropdownMenu
            topic={topic}
            isArchiveView={isArchiveView}
            onStartRename={handleStartRename}
            onPin={onPin}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}

interface TopicDropdownMenuProps {
  topic: TopicItem;
  isArchiveView: boolean;
  onStartRename: () => void;
  onPin: (topicId: string, pinned: boolean) => void;
  onArchive: (topicId: string) => void;
  onUnarchive: (topicId: string) => void;
  onDelete: (topicId: string) => void;
}

function TopicDropdownMenu({
  topic,
  isArchiveView,
  onStartRename,
  onPin,
  onArchive,
  onUnarchive,
  onDelete,
}: TopicDropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 opacity-0 transition hover:bg-zinc-100 hover:text-zinc-600 group-hover:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        aria-label="更多操作"
      >
        <span className="text-sm leading-none">⋮</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            tabIndex={-1}
            aria-label="关闭菜单"
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-32 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => handleAction(onStartRename)}
              className="flex w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              重命名
            </button>
            {!isArchiveView && (
              <button
                type="button"
                onClick={() =>
                  handleAction(() => onPin(topic.id, !topic.pinned))
                }
                className="flex w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                {topic.pinned ? "取消置顶" : "置顶"}
              </button>
            )}
            {isArchiveView ? (
              <button
                type="button"
                onClick={() => handleAction(() => onUnarchive(topic.id))}
                className="flex w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                恢复
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAction(() => onArchive(topic.id))}
                className="flex w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                归档
              </button>
            )}
            <div className="my-1 border-t border-zinc-200 dark:border-zinc-700" />
            <button
              type="button"
              onClick={() => handleAction(() => onDelete(topic.id))}
              className="flex w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              删除
            </button>
          </div>
        </>
      )}
    </div>
  );
}
