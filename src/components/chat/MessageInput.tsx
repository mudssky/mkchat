"use client";

import { Sender } from "@ant-design/x";
import { Input } from "antd";
import { type ComponentProps, useCallback, useMemo, useState } from "react";

const SenderInput = (props: ComponentProps<typeof Input.TextArea>) => (
  <Input.TextArea {...props} aria-label="聊天输入" />
);

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  disabled = false,
}: MessageInputProps) {
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEmpty = useMemo(() => value.trim().length === 0, [value]);

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
        await onSend(trimmed);
        onChange("");
      } finally {
        setIsSending(false);
      }
    },
    [disabled, isSending, onSend, onChange],
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
        errorMessage ? (
          <span className="text-xs text-red-500">{errorMessage}</span>
        ) : isEmpty ? (
          <span className="text-xs text-zinc-400">请输入内容后发送</span>
        ) : null
      }
    />
  );
}
