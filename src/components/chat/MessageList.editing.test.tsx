import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "@/types/chat";
import { MessageList } from "./MessageList";

vi.mock("./MessageBubble", () => ({
  MessageBubble: ({ message }: { message: ChatMessage }) => (
    <div data-testid={`bubble-${message.id}`}>{message.content}</div>
  ),
}));

vi.mock("./BranchNavigator", () => ({
  BranchNavigator: () => null,
}));

const messages: ChatMessage[] = [
  {
    id: "root",
    topicId: "topic",
    content: "root",
    role: "assistant",
    createdAt: "2024-01-01T00:00:00Z",
    parentId: null,
  },
  {
    id: "child",
    topicId: "topic",
    content: "child",
    role: "user",
    createdAt: "2024-01-01T00:00:01Z",
    parentId: "root",
  },
  {
    id: "leaf",
    topicId: "topic",
    content: "leaf",
    role: "assistant",
    createdAt: "2024-01-01T00:00:02Z",
    parentId: "child",
  },
];

describe("MessageList editing", () => {
  it("opens editor and submits edited content", () => {
    const onEditMessage = vi.fn();

    render(
      <MessageList
        messages={messages}
        currentLeafId="leaf"
        onSelectLeaf={vi.fn()}
        onEditMessage={onEditMessage}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "编辑消息" })[1]);
    const textarea = screen.getByRole("textbox", { name: "编辑消息" });
    fireEvent.change(textarea, { target: { value: "child updated" } });
    fireEvent.click(screen.getByRole("button", { name: "提交" }));

    expect(onEditMessage).toHaveBeenCalledWith(
      expect.objectContaining({ id: "child" }),
      "child updated",
    );
  });
});
