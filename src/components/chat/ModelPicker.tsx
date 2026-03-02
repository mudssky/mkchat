"use client";

import { useQuery } from "@tanstack/react-query";
import { Popover, Tag } from "antd";
import { GitCompareArrows, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { assistantListResponseSchema } from "@/lib/chat/assistant-schema";
import type { CompareModelSelection } from "@/store/chat-store";
import type { AssistantSummary } from "@/types/chat";

const MAX_MODELS = 4;
const MIN_MODELS = 2;

interface ModelPickerProps {
  selected: CompareModelSelection[];
  onChange: (models: CompareModelSelection[]) => void;
  disabled?: boolean;
}

interface GroupedModels {
  providerName: string;
  assistants: AssistantSummary[];
}

function groupByProvider(assistants: AssistantSummary[]): GroupedModels[] {
  const map = new Map<string, AssistantSummary[]>();
  for (const a of assistants) {
    const key = a.providerName ?? "Unknown";
    const list = map.get(key);
    if (list) list.push(a);
    else map.set(key, [a]);
  }
  return Array.from(map.entries()).map(([providerName, items]) => ({
    providerName,
    assistants: items,
  }));
}

export function ModelPicker({
  selected,
  onChange,
  disabled = false,
}: ModelPickerProps) {
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["assistants"],
    queryFn: async () => {
      const response = await fetch("/api/assistants");
      if (!response.ok) throw new Error(await response.text());
      return assistantListResponseSchema.parse(await response.json());
    },
  });

  const assistants = useMemo(
    () => (data?.assistants ?? []).filter((a) => a.providerConfigId),
    [data?.assistants],
  );

  const groups = useMemo(() => groupByProvider(assistants), [assistants]);

  const selectedIds = useMemo(
    () => new Set(selected.map((s) => s.assistantId)),
    [selected],
  );

  const toggleModel = useCallback(
    (assistant: AssistantSummary) => {
      if (selectedIds.has(assistant.id)) {
        onChange(selected.filter((s) => s.assistantId !== assistant.id));
      } else if (selected.length < MAX_MODELS) {
        onChange([
          ...selected,
          {
            assistantId: assistant.id,
            modelId: assistant.modelId,
            providerName: assistant.providerName ?? "Unknown",
          },
        ]);
      }
    },
    [onChange, selected, selectedIds],
  );

  const removeModel = useCallback(
    (assistantId: string) => {
      onChange(selected.filter((s) => s.assistantId !== assistantId));
    },
    [onChange, selected],
  );

  const hasNoModels = assistants.length < MIN_MODELS;

  const content = hasNoModels ? (
    <div className="w-64 p-3 text-center text-sm text-zinc-500">
      <p>请先在设置中配置至少 2 个模型</p>
      <a
        href="/settings/providers"
        className="mt-2 inline-block text-blue-500 hover:underline"
      >
        前往设置
      </a>
    </div>
  ) : (
    <div className="w-72 max-h-80 overflow-y-auto p-2">
      <div className="mb-2 text-xs text-zinc-400">
        选择 {MIN_MODELS}-{MAX_MODELS} 个模型进行对比
      </div>
      {groups.map((group) => (
        <div key={group.providerName} className="mb-2">
          <div className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {group.providerName}
          </div>
          {group.assistants.map((assistant) => {
            const isSelected = selectedIds.has(assistant.id);
            const isDisabled = !isSelected && selected.length >= MAX_MODELS;
            return (
              <button
                key={assistant.id}
                type="button"
                disabled={isDisabled}
                onClick={() => toggleModel(assistant)}
                className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : isDisabled
                      ? "cursor-not-allowed text-zinc-300 dark:text-zinc-600"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex-1 truncate">
                  {assistant.name}
                  <span className="ml-1 text-xs text-zinc-400">
                    ({assistant.modelId})
                  </span>
                </span>
                {isSelected && <span className="text-xs text-blue-500">✓</span>}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <Popover
        content={content}
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="topLeft"
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600"
          aria-label="对比模型"
        >
          <GitCompareArrows size={14} />
          对比
          {selected.length > 0 && (
            <span className="ml-1 rounded-full bg-blue-500 px-1.5 text-[10px] text-white">
              {selected.length}
            </span>
          )}
        </button>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((model) => (
            <Tag
              key={model.assistantId}
              closable
              onClose={() => removeModel(model.assistantId)}
              closeIcon={<X size={10} />}
              className="m-0 text-xs"
            >
              {model.modelId}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}
