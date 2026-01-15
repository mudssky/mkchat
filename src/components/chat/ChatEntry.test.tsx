import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatEntry } from "./ChatEntry";

const pushMock = vi.fn();
const useQueryMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => useQueryMock(),
}));

const assistantList = [
  {
    id: "assistant-1",
    name: "Demo",
    description: "测试助手描述",
    modelId: "model",
    providerConfigId: "provider",
    topics: [
      {
        id: "topic-1",
        title: "First",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
      },
    ],
  },
];

describe("ChatEntry", () => {
  beforeEach(() => {
    pushMock.mockReset();
    useQueryMock.mockReset();
  });

  it("creates a topic and navigates", async () => {
    useQueryMock.mockReturnValue({
      data: { assistants: assistantList },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ topic: { id: "topic-2" } }),
    });
    global.fetch = fetchMock;

    render(<ChatEntry />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "新对话" }));
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assistantId: "assistant-1" }),
    });
    expect(pushMock).toHaveBeenCalledWith("/chat/topic-2");
  });

  it("shows error when request fails", async () => {
    useQueryMock.mockReturnValue({
      data: { assistants: assistantList },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Assistant is missing provider configuration.",
      }),
    });
    global.fetch = fetchMock;

    render(<ChatEntry />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "新对话" }));
    });

    expect(screen.getByText("助手未配置模型提供商。")).toBeTruthy();
  });

  it("filters assistants by search query", () => {
    useQueryMock.mockReturnValue({
      data: { assistants: assistantList },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<ChatEntry />);

    const input = screen.getByRole("searchbox", { name: "搜索助手" });
    fireEvent.change(input, { target: { value: "nope" } });
    expect(screen.getByText("未找到匹配的助手")).toBeTruthy();

    fireEvent.change(input, { target: { value: "demo" } });
    expect(screen.getByText("Demo")).toBeTruthy();
    expect(screen.getByRole("link", { name: "编辑助手" })).toBeTruthy();
  });
});
