import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatContainer } from "./ChatContainer";

const mockSendMessage = vi.fn();
const mockSetMessages = vi.fn();
const mockRegenerate = vi.fn();
const mockStop = vi.fn();

vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: [
      {
        id: "m1",
        role: "user",
        parts: [{ type: "text", text: "hi" }],
        metadata: {
          topicId: "topic",
          parentId: null,
          createdAt: "2024-01-01T00:00:00Z",
        },
      },
    ],
    sendMessage: mockSendMessage,
    status: "ready",
    error: undefined,
    stop: mockStop,
    regenerate: mockRegenerate,
    setMessages: mockSetMessages,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: {
      topic: {
        id: "topic",
        assistantId: "assistant",
        title: "Demo",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messages: [
          {
            id: "m1",
            topicId: "topic",
            content: "hi",
            role: "user",
            createdAt: "2024-01-01T00:00:00Z",
            parentId: null,
          },
        ],
      },
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

const chatStoreState = {
  currentBranchPath: ["m1"],
  setCurrentBranch: vi.fn(),
  inputDraft: "draft",
  updateDraft: vi.fn(),
};

vi.mock("@/store/chat-store", () => ({
  useChatStore: (selector: (state: typeof chatStoreState) => unknown) =>
    selector(chatStoreState),
}));

vi.mock("./MessageList", () => ({
  MessageList: ({ messages }: { messages: Array<{ id: string }> }) => (
    <div data-testid="message-list">{messages.length}</div>
  ),
}));

vi.mock("./MessageInput", () => ({
  MessageInput: ({ value }: { value: string }) => (
    <div data-testid="message-input">{value}</div>
  ),
}));

describe("ChatContainer", () => {
  it("renders message list and input", () => {
    render(<ChatContainer topicId="topic" />);

    expect(screen.getByTestId("message-list")).toHaveTextContent("1");
    expect(screen.getByTestId("message-input")).toHaveTextContent("draft");
  });
});
