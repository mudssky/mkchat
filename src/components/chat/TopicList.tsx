"use client";

import { Archive, ArchiveRestore, Search } from "lucide-react";
import { useCallback, useState } from "react";
import { TopicListItem } from "@/components/chat/TopicListItem";
import {
  type TopicSortField,
  useTopicSearch,
  useTopics,
} from "@/hooks/use-topics";

const SORT_OPTIONS: {
  label: string;
  value: TopicSortField;
  order: "asc" | "desc";
}[] = [
  { label: "最近活跃", value: "updatedAt", order: "desc" },
  { label: "创建时间", value: "createdAt", order: "desc" },
  { label: "标题", value: "title", order: "asc" },
];

export function TopicList() {
  const [sortIndex, setSortIndex] = useState(0);
  const [showArchived, setShowArchived] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { searchInput, debouncedSearch, handleSearchChange } = useTopicSearch();

  const currentSort = SORT_OPTIONS[sortIndex];
  const {
    topics,
    isLoading,
    isError,
    error,
    refetch,
    deleteTopic,
    updateTopic,
  } = useTopics({
    search: debouncedSearch || undefined,
    sort: currentSort.value,
    order: currentSort.order,
    archived: showArchived,
  });

  const handleRename = useCallback(
    async (topicId: string, newTitle: string) => {
      setRenamingId(null);
      await updateTopic({ topicId, data: { title: newTitle } });
    },
    [updateTopic],
  );

  const handlePin = useCallback(
    async (topicId: string, pinned: boolean) => {
      await updateTopic({ topicId, data: { pinned } });
    },
    [updateTopic],
  );

  const handleArchive = useCallback(
    async (topicId: string) => {
      await updateTopic({
        topicId,
        data: { archivedAt: new Date().toISOString() },
      });
    },
    [updateTopic],
  );

  const handleUnarchive = useCallback(
    async (topicId: string) => {
      await updateTopic({ topicId, data: { archivedAt: null } });
    },
    [updateTopic],
  );

  const handleDeleteConfirm = useCallback(
    async (topicId: string) => {
      setDeleteConfirmId(null);
      await deleteTopic(topicId);
    },
    [deleteTopic],
  );

  const handleSortChange = () => {
    setSortIndex((prev) => (prev + 1) % SORT_OPTIONS.length);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm text-zinc-500">正在加载会话列表...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm text-zinc-600">加载失败：{error?.message}</div>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search and controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="搜索会话..."
            aria-label="搜索会话"
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs text-zinc-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Sort toggle */}
          <button
            type="button"
            onClick={handleSortChange}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600"
            title="切换排序方式"
          >
            {currentSort.label}
          </button>

          {/* Archive toggle */}
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              showArchived
                ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600"
            }`}
            title={showArchived ? "查看活跃会话" : "查看归档会话"}
          >
            {showArchived ? (
              <>
                <ArchiveRestore className="h-3.5 w-3.5" />
                归档
              </>
            ) : (
              <>
                <Archive className="h-3.5 w-3.5" />
                归档
              </>
            )}
          </button>
        </div>
      </div>

      {/* Topic list */}
      {topics.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          {showArchived
            ? "暂无归档会话"
            : debouncedSearch
              ? "未找到匹配的会话"
              : "暂无会话"}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {topics.map((topic) => (
            <TopicListItem
              key={topic.id}
              topic={topic}
              isArchiveView={showArchived}
              isRenaming={renamingId === topic.id}
              onStartRename={(id) => setRenamingId(id)}
              onCancelRename={() => setRenamingId(null)}
              onRename={handleRename}
              onPin={handlePin}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              确认删除
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              删除后所有消息将被永久删除，不可恢复。
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
