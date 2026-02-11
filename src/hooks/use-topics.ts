"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export interface TopicItem {
  id: string;
  title: string | null;
  assistantId: string;
  pinned: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assistant: {
    name: string;
    modelId: string;
  };
}

interface TopicListResponse {
  topics: TopicItem[];
}

export type TopicSortField = "updatedAt" | "createdAt" | "title";
export type TopicSortOrder = "asc" | "desc";

interface UseTopicsParams {
  search?: string;
  sort?: TopicSortField;
  order?: TopicSortOrder;
  archived?: boolean;
  assistantId?: string;
}

function buildQueryString(params: UseTopicsParams): string {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  if (params.archived) searchParams.set("archived", "true");
  if (params.assistantId) searchParams.set("assistantId", params.assistantId);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export function useTopics(params: UseTopicsParams = {}) {
  const queryClient = useQueryClient();
  const queryKey = ["topics", params];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<TopicItem[]> => {
      const response = await fetch(`/api/topics${buildQueryString(params)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch topics");
      }
      const data = (await response.json()) as TopicListResponse;
      return data.topics;
    },
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["topics"] });
  }, [queryClient]);

  const deleteMutation = useMutation({
    mutationFn: async (topicId: string) => {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete topic");
    },
    onSuccess: invalidate,
  });

  const patchMutation = useMutation({
    mutationFn: async ({
      topicId,
      data,
    }: {
      topicId: string;
      data: { title?: string; pinned?: boolean; archivedAt?: string | null };
    }) => {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update topic");
      return response.json();
    },
    onSuccess: invalidate,
  });

  return {
    topics: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    deleteTopic: deleteMutation.mutateAsync,
    updateTopic: patchMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    isUpdating: patchMutation.isPending,
  };
}

export function useTopicSearch(initialSearch = "") {
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        setDebouncedSearch(value);
      }, 300);
      setDebounceTimer(timer);
    },
    [debounceTimer],
  );

  return {
    searchInput,
    debouncedSearch,
    handleSearchChange,
  };
}
