"use client";

import { Sender } from "@ant-design/x";
import { Input } from "antd";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import type { CompareModelSelection } from "@/store/chat-store";
import { ModelPicker } from "./ModelPicker";

const SenderInput = (props: ComponentProps<typeof Input.TextArea>) => (
  <Input.TextArea {...props} aria-label="聊天输入" />
);

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  compareModels?: CompareModelSelection[];
  onCompareModelsChange?: (models: CompareModelSelection[]) => void;
  onCompareSend?: (content: string) => Promise<void>;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  disabled = false,
  compareModels = [],
  onCompareModelsChange,
  onCompareSend,
}: MessageInputProps) {
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEmpty = useMemo(() => value.trim().length === 0, [value]);
  const isCompareMode = compareModels.length >= 2;

  const handleSend = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) {
        setErrorMessage("消息不能为空");
        return;
      }
      if (isSending || disabled) return;
      setIsSending(true);
      setErrorMessage(null);
      try {
        if (isCompareMode && onCompareSend) {
          await onCompareSend(trimmed);
        } else {
          await onSend(trimmed);
        }
        onChange("");
      } finally {
        setIsSending(false);
      }
    },
    [disabled, isCompareMode, isSending, onCompareSend, onSend, onChange],
  );

  return (
    <Sender
      value={value}
      onChange={(nextValue) => {
        onChange(nextValue);
        if (errorMessage && nextValue.trim()) {
          setErrorMessage(null);
        }
      }}
      onSubmit={(content) => void handleSend(content)}
      onKeyDown={(event) => {
        if (event.key !== "Enter") return undefined;
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          void handleSend(value);
          return false;
        }
        if (event.shiftKey) {
          return false;
        }
        return undefined;
      }}
      placeholder="输入消息，Ctrl + Enter 发送"
      autoSize={{ minRows: 2, maxRows: 5 }}
      submitType="shiftEnter"
      disabled={disabled || isSending}
      loading={isSending || disabled}
      components={{ input: SenderInput }}
      className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      classNames={{
        input: "text-sm leading-6",
      }}
      footer={
        <div className="flex flex-col gap-1">
          {onCompareModelsChange && (
            <ModelPicker
              selected={compareModels}
              onChange={onCompareModelsChange}
              disabled={disabled || isSending}
            />
          )}
          {errorMessage ? (
            <span className="text-xs text-red-500" role="alert">
              {errorMessage}
            </span>
          ) : isEmpty ? (
            <span className="text-xs text-zinc-400">
              {isCompareMode
                ? "对比模式：发送后将同时向多个模型请求"
                : "请输入内容后发送"}
            </span>
          ) : null}
        </div>
      }
    />
  );
}
