import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatContainer } from "./ChatContainer";

const mockSendMessage = vi.fn();
const mockSetMessages = vi.fn();
const mockRegenerate = vi.fn();
const mockStop = vi.fn();
const useChatMock = vi.fn();

vi.mock("@ai-sdk/react", () => ({
  useChat: (...args: unknown[]) => useChatMock(...args),
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
  beforeEach(() => {
    mockSendMessage.mockReset();
    mockSetMessages.mockReset();
    mockRegenerate.mockReset();
    mockStop.mockReset();
    useChatMock.mockReset();
  });

  it("renders message list and input", () => {
    useChatMock.mockReturnValue({
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
    });

    render(<ChatContainer topicId="topic" />);

    expect(screen.getByTestId("message-list")).toHaveTextContent("1");
    expect(screen.getByTestId("message-input")).toHaveTextContent("draft");
  });

  it("shows retry area when chat error exists", () => {
    useChatMock.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      status: "ready",
      error: new Error("network broken"),
      stop: mockStop,
      regenerate: mockRegenerate,
      setMessages: mockSetMessages,
    });

    render(<ChatContainer topicId="topic" />);

    const retryButton = screen.getByRole("button", { name: "重试生成" });
    expect(retryButton).toBeTruthy();

    fireEvent.click(retryButton);
    expect(mockRegenerate).toHaveBeenCalledTimes(1);
    expect(mockRegenerate).toHaveBeenCalledWith({
      metadata: {
        topicId: "topic",
        assistantId: "assistant",
        parentId: "m1",
      },
    });
  });

  it("shows stop button while busy", () => {
    useChatMock.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      status: "streaming",
      error: undefined,
      stop: mockStop,
      regenerate: mockRegenerate,
      setMessages: mockSetMessages,
    });

    render(<ChatContainer topicId="topic" />);

    const stopButton = screen.getByRole("button", { name: "停止生成" });
    expect(stopButton).toBeTruthy();
    fireEvent.click(stopButton);
    expect(mockStop).toHaveBeenCalledTimes(1);
  });

  it("subscribes performance metrics in dev", () => {
    vi.stubEnv("NODE_ENV", "development");

    useChatMock.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      status: "ready",
      error: undefined,
      stop: mockStop,
      regenerate: mockRegenerate,
      setMessages: mockSetMessages,
    });

    render(<ChatContainer topicId="topic" />);

    const event = new CustomEvent("mkchat:chat-performance", {
      detail: {
        name: "ui-message-normalize",
        durationMs: 1.23,
        messageCount: 0,
      },
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(screen.getByText("性能监控（最近 5 条）")).toBeTruthy();

    vi.unstubAllEnvs();
  });
});
