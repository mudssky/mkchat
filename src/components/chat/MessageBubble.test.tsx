/**
 * MessageBubble.test.tsx
 *
 * 测试 MessageBubble 组件
 * ROI: ⭐⭐⭐⭐ (通用 UI 组件，快照/渲染测试)
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { MessageBubble } from "./MessageBubble";

vi.mock("next/dynamic", () => ({
  default: (
    _loader: () => Promise<unknown>,
    options?: { loading?: () => ReactNode },
  ) => {
    const Loading = options?.loading;
    return function DynamicComponent() {
      return Loading ? Loading() : null;
    };
  },
}));

interface MockBubbleProps {
  content: string;
  className?: string;
  classNames?: {
    content?: string;
    footer?: string;
  };
  contentRender?: (content: string, info: Record<string, never>) => ReactNode;
  footer?:
    | ReactNode
    | ((content: string, info: Record<string, never>) => ReactNode);
}

vi.mock("@ant-design/x", () => ({
  Bubble: ({
    content,
    contentRender,
    classNames,
    className,
    footer,
  }: MockBubbleProps) => {
    const info: Record<string, never> = {};
    const resolvedContent = contentRender
      ? contentRender(content, info)
      : content;
    const resolvedFooter =
      typeof footer === "function" ? footer(content, info) : footer;

    return (
      <div className={className} data-testid="bubble-root">
        <div data-testid="bubble-content" className={classNames?.content}>
          {resolvedContent}
        </div>
        {resolvedFooter ? (
          <div data-testid="bubble-footer" className={classNames?.footer}>
            {resolvedFooter}
          </div>
        ) : null}
      </div>
    );
  },
}));

describe("MessageBubble 组件", () => {
  it("渲染用户消息并右对齐", () => {
    render(
      <MessageBubble
        message={{
          id: "m1",
          role: "user",
          content: "Hello",
          createdAt: "2024-01-01T10:00:00Z",
          topicId: "topic-1",
          parentId: null,
        }}
      />,
    );

    const wrapper = screen.getByTestId("message-bubble");
    const content = screen.getByTestId("bubble-content");

    expect(wrapper).toHaveClass("justify-end");
    expect(content).toHaveClass("bg-blue-600");
  });

  it("渲染 AI 消息并支持 Markdown", () => {
    render(
      <MessageBubble
        message={{
          id: "m2",
          role: "assistant",
          content: "Hello **world**",
          createdAt: "2024-01-01T10:00:00Z",
          topicId: "topic-1",
          parentId: null,
        }}
      />,
    );

    const wrapper = screen.getByTestId("message-bubble");
    const content = screen.getByTestId("bubble-content");
    const bold = screen.getByText("world");

    expect(wrapper).toHaveClass("justify-start");
    expect(content).toHaveClass("bg-zinc-100");
    expect(bold.tagName).toBe("STRONG");
  });

  it("代码块包含复制按钮并可触发复制", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(
      <MessageBubble
        message={{
          id: "m3",
          role: "assistant",
          content: "```ts\nconst name = 'mkchat';\n```",
          createdAt: "2024-01-01T10:00:00Z",
          topicId: "topic-1",
          parentId: null,
        }}
      />,
    );

    const copyButton = screen.getByRole("button", { name: "Copy code" });
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(writeText).toHaveBeenCalledWith("const name = 'mkchat';");
  });
});
