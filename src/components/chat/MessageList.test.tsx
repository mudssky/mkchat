import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "@/types/chat";
import { MessageList } from "./MessageList";

vi.mock("./MessageBubble", () => ({
  MessageBubble: ({ message }: { message: ChatMessage }) => (
    <div data-testid={`message-${message.id}`}>{message.content}</div>
  ),
}));

vi.mock("./BranchNavigator", () => ({
  BranchNavigator: ({
    branches,
    onSelectChild,
  }: {
    branches: ChatMessage[];
    onSelectChild: (id: string) => void;
  }) => (
    <button
      type="button"
      data-testid="branch-nav"
      onClick={() => onSelectChild(branches[1].id)}
    >
      Branches: {branches.length}
    </button>
  ),
}));

const baseMessages: ChatMessage[] = [
  {
    id: "root",
    topicId: "topic",
    content: "Root message",
    role: "user",
    createdAt: "2024-01-01T00:00:00Z",
    parentId: null,
  },
  {
    id: "child-a",
    topicId: "topic",
    content: "Child A",
    role: "assistant",
    createdAt: "2024-01-02T00:00:00Z",
    parentId: "root",
  },
  {
    id: "child-b",
    topicId: "topic",
    content: "Child B",
    role: "assistant",
    createdAt: "2024-01-03T00:00:00Z",
    parentId: "root",
  },
];

describe("MessageList", () => {
  it("renders empty state when no chain", () => {
    render(
      <MessageList messages={[]} currentLeafId={null} onSelectLeaf={vi.fn()} />,
    );

    expect(screen.getByText("还没有消息，向 助手 发起对话吧。")).toBeTruthy();
    expect(screen.getByText("推荐起始问题")).toBeTruthy();
    expect(screen.getByText("帮我总结今天的会议要点。")).toBeTruthy();
  });

  it("renders message chain and branch indicator", () => {
    const onSelectLeaf = vi.fn();

    render(
      <MessageList
        messages={baseMessages}
        currentLeafId="child-a"
        onSelectLeaf={onSelectLeaf}
      />,
    );

    expect(screen.getByTestId("message-root")).toBeTruthy();
    expect(screen.getByTestId("message-child-a")).toBeTruthy();
    expect(screen.getByTestId("branch-nav")).toBeTruthy();

    fireEvent.click(screen.getByTestId("branch-nav"));

    expect(onSelectLeaf).toHaveBeenCalledWith("child-b");
  });
});
