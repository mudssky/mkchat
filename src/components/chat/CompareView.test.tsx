import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CompareStreamState } from "@/hooks/use-compare-chat";
import type { ChatMessage } from "@/types/chat";
import { CompareView } from "./CompareView";

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe("CompareView", () => {
  it("renders nothing when no data", () => {
    const { container } = render(<CompareView />);
    expect(container.innerHTML).toBe("");
  });

  it("renders streaming columns", () => {
    const streams: CompareStreamState[] = [
      {
        assistantId: "a1",
        modelId: "gpt-4o",
        providerName: "OpenAI",
        content: "Hello from GPT",
        status: "streaming",
      },
      {
        assistantId: "a2",
        modelId: "claude-3",
        providerName: "Anthropic",
        content: "Hello from Claude",
        status: "completed",
        messageId: "m2",
      },
    ];

    render(<CompareView streamStates={streams} />);

    expect(screen.getByTestId("compare-view")).toBeTruthy();
    expect(screen.getByText("gpt-4o")).toBeTruthy();
    expect(screen.getByText("claude-3")).toBeTruthy();
    expect(screen.getByText("Hello from GPT")).toBeTruthy();
    expect(screen.getByText("Hello from Claude")).toBeTruthy();
    expect(screen.getByText("生成中...")).toBeTruthy();
    expect(screen.getByText("✓ 完成")).toBeTruthy();
  });

  it("renders pending status", () => {
    const streams: CompareStreamState[] = [
      {
        assistantId: "a1",
        modelId: "gpt-4o",
        providerName: "OpenAI",
        content: "",
        status: "pending",
      },
    ];

    render(<CompareView streamStates={streams} />);
    expect(screen.getByText("思考中...")).toBeTruthy();
    expect(screen.getByText("等待响应...")).toBeTruthy();
  });

  it("renders error status", () => {
    const streams: CompareStreamState[] = [
      {
        assistantId: "a1",
        modelId: "gpt-4o",
        providerName: "OpenAI",
        content: "",
        status: "error",
        error: "Network failure",
      },
    ];

    render(<CompareView streamStates={streams} />);
    expect(screen.getByText("✗ 错误")).toBeTruthy();
    expect(screen.getByText("Network failure")).toBeTruthy();
  });

  it("renders persisted messages with vote buttons", () => {
    const messages: ChatMessage[] = [
      {
        id: "m1",
        topicId: "t1",
        content: "Response A",
        role: "assistant",
        parentId: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        metadata: {
          compareGroupId: "g1",
          compareModelId: "gpt-4o",
          compareProviderName: "OpenAI",
        },
      },
      {
        id: "m2",
        topicId: "t1",
        content: "Response B",
        role: "assistant",
        parentId: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        metadata: {
          compareGroupId: "g1",
          compareModelId: "claude-3",
          compareProviderName: "Anthropic",
        },
      },
    ];

    render(<CompareView messages={messages} onVote={vi.fn()} />);

    expect(screen.getByText("Response A")).toBeTruthy();
    expect(screen.getByText("Response B")).toBeTruthy();
    // Vote buttons should be present (2 per column = 4 total)
    expect(screen.getAllByLabelText("赞")).toHaveLength(2);
    expect(screen.getAllByLabelText("踩")).toHaveLength(2);
  });

  it("calls onVote when vote button clicked", () => {
    const onVote = vi.fn();
    const messages: ChatMessage[] = [
      {
        id: "m1",
        topicId: "t1",
        content: "Response",
        role: "assistant",
        parentId: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        metadata: {
          compareGroupId: "g1",
          compareModelId: "gpt-4o",
          compareProviderName: "OpenAI",
        },
      },
    ];

    render(<CompareView messages={messages} onVote={onVote} />);

    fireEvent.click(screen.getByLabelText("赞"));
    expect(onVote).toHaveBeenCalledWith("m1", "up");
  });

  it("shows continue button when onContinue provided", () => {
    const onContinue = vi.fn();
    const messages: ChatMessage[] = [
      {
        id: "m1",
        topicId: "t1",
        content: "Response",
        role: "assistant",
        parentId: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        metadata: {
          compareGroupId: "g1",
          compareModelId: "gpt-4o",
          compareProviderName: "OpenAI",
        },
      },
    ];

    render(<CompareView messages={messages} onContinue={onContinue} />);

    const continueBtn = screen.getByText("继续对话");
    expect(continueBtn).toBeTruthy();
    fireEvent.click(continueBtn);
    expect(onContinue).toHaveBeenCalledWith("m1");
  });
});
