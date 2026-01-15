"use client";

import { Bubble } from "@ant-design/x";
import { Check, Copy } from "lucide-react";
import dynamic from "next/dynamic";
import {
  isValidElement,
  type ReactNode,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  className?: string;
  statusLabel?: string;
  statusTone?: "info" | "warning" | "neutral";
  showCursor?: boolean;
}

const CodeHighlight = dynamic(
  () => import("./CodeHighlight").then((mod) => mod.CodeHighlight),
  {
    ssr: false,
    loading: () => (
      <pre className="overflow-x-auto rounded-lg bg-zinc-950 px-4 py-3 text-[0.85rem] leading-5 text-zinc-100">
        正在加载代码高亮...
      </pre>
    ),
  },
);

function normalizeCodeChildren(children: ReactNode): string {
  if (typeof children === "string") {
    return children;
  }

  if (Array.isArray(children)) {
    return children
      .map((child) => (typeof child === "string" ? child : ""))
      .join("");
  }

  return "";
}

function formatMessageTime(value?: Date | string | null) {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, value]);

  return debouncedValue;
}

function CodeBlock({ inline, className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const rawCode = normalizeCodeChildren(children).replace(/\n$/, "");
  const match = /language-(\w+)/.exec(className ?? "");
  const language = match?.[1] ?? "text";

  const handleCopy = useCallback(async () => {
    if (!rawCode) return;
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }

    await navigator.clipboard.writeText(rawCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [rawCode]);

  if (inline) {
    return (
      <code className="rounded bg-zinc-200 px-1 py-0.5 text-[0.9em] dark:bg-zinc-800">
        {rawCode}
      </code>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white/90 px-2 py-1 text-xs font-medium text-zinc-600 shadow-sm transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300"
        aria-label="Copy code"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </>
        )}
      </button>
      <CodeHighlight code={rawCode} language={language} />
    </div>
  );
}

export function MessageBubble({
  message,
  className,
  statusLabel,
  statusTone = "neutral",
  showCursor = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const timestamp = useMemo(
    () => formatMessageTime(message.createdAt),
    [message.createdAt],
  );
  const deferredContent = useDeferredValue(message.content);
  const debouncedContent = useDebouncedValue(deferredContent, 60);
  const statusStyles = useMemo(() => {
    switch (statusTone) {
      case "warning":
        return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200";
      default:
        return "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300";
    }
  }, [statusTone]);

  const markdownComponents: Components = useMemo(
    () => ({
      pre: ({ children }) => {
        if (!isValidElement(children)) {
          return <pre>{children}</pre>;
        }

        const childProps = children.props as {
          className?: string;
          children?: ReactNode;
        };

        return (
          <CodeBlock inline={false} className={childProps.className}>
            {childProps.children}
          </CodeBlock>
        );
      },
      code: ({ children }) => (
        <CodeBlock inline className={undefined}>
          {children}
        </CodeBlock>
      ),
    }),
    [],
  );

  const footerContent =
    timestamp || statusLabel ? (
      <div className="flex flex-wrap items-center gap-2">
        {statusLabel ? (
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
              statusStyles,
            )}
          >
            {statusLabel}
          </span>
        ) : null}
        {timestamp ? <span>{timestamp}</span> : null}
      </div>
    ) : null;

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        className,
      )}
      data-testid="message-bubble"
      data-role={message.role}
    >
      <Bubble<string>
        content={debouncedContent}
        placement={isUser ? "end" : "start"}
        className="max-w-[80%]"
        classNames={{
          content: cn(
            "rounded-2xl px-4 py-3 text-sm leading-6",
            isUser
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
          ),
          footer: "mt-2 text-xs text-zinc-400 dark:text-zinc-500",
        }}
        contentRender={(content) => (
          <div className="flex items-end gap-1">
            <div className="min-w-0 flex-1">
              <ReactMarkdown components={markdownComponents}>
                {String(content)}
              </ReactMarkdown>
            </div>
            {showCursor ? (
              <span className="inline-block animate-pulse text-zinc-400">
                ▍
              </span>
            ) : null}
          </div>
        )}
        footer={footerContent}
      />
    </div>
  );
}
