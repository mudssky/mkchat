import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const assistantMock = {
  id: "assistant-1",
  modelId: "model",
  systemPrompt: null,
  providerConfig: { id: "provider" },
};

const prismaMock = vi.hoisted(() => ({
  assistant: {
    findUnique: vi.fn(),
  },
}));

const chatServiceMock = vi.hoisted(() => ({
  createMessage: vi.fn(),
  getTrace: vi.fn(),
}));

const mcpServiceMock = vi.hoisted(() => ({
  getToolsForAssistant: vi.fn(),
  executeTool: vi.fn(),
}));

const streamTextMock = vi.hoisted(() => vi.fn());
const getModelMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/services/chat-service", () => ({
  chatService: chatServiceMock,
}));

vi.mock("@/services/mcp-service", () => ({
  mcpService: mcpServiceMock,
}));

vi.mock("@/lib/ai/model-factory", () => ({
  getModel: getModelMock,
}));

vi.mock("ai", async () => {
  const actual = await vi.importActual<typeof import("ai")>("ai");
  return {
    ...actual,
    streamText: streamTextMock,
  };
});

describe("POST /api/chat", () => {
  const validTopicId = `c${"a".repeat(24)}`;

  beforeEach(() => {
    prismaMock.assistant.findUnique.mockReset();
    chatServiceMock.createMessage.mockReset();
    chatServiceMock.getTrace.mockReset();
    mcpServiceMock.getToolsForAssistant.mockReset();
    mcpServiceMock.executeTool.mockReset();
    streamTextMock.mockReset();
    getModelMock.mockReset();
  });

  it("returns 400 on invalid payload", async () => {
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ topicId: "bad" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 404 on invalid topic id", async () => {
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        topicId: "invalid",
        assistantId: "assistant-1",
        message: "hi",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
  });

  it("streams response for valid request", async () => {
    prismaMock.assistant.findUnique.mockResolvedValue(assistantMock);
    chatServiceMock.createMessage.mockResolvedValue({
      id: "msg-1",
      topicId: validTopicId,
      content: "hi",
      role: "user",
      parentId: null,
      createdAt: new Date(),
    });
    chatServiceMock.getTrace.mockResolvedValue([
      {
        id: "msg-1",
        topicId: validTopicId,
        content: "hi",
        role: "user",
        parentId: null,
        createdAt: new Date(),
      },
    ]);
    mcpServiceMock.getToolsForAssistant.mockResolvedValue([]);
    getModelMock.mockReturnValue({});

    const streamResponse = new Response("stream");
    streamTextMock.mockReturnValue({
      toUIMessageStreamResponse: vi.fn().mockReturnValue(streamResponse),
    });

    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        topicId: validTopicId,
        assistantId: "assistant-1",
        message: "hi",
      }),
    });

    const response = await POST(request);

    expect(response).toBe(streamResponse);
    expect(streamTextMock).toHaveBeenCalled();
  });

  it("returns 400 on missing user message content", async () => {
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        topicId: validTopicId,
        assistantId: "assistant-1",
        messages: [],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Missing message content",
    });
  });

  it("returns 404 when assistant provider missing", async () => {
    prismaMock.assistant.findUnique.mockResolvedValue({
      ...assistantMock,
      providerConfig: null,
    });

    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        topicId: validTopicId,
        assistantId: "assistant-1",
        message: "hello",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
    await expect(response.text()).resolves.toBe(
      "Assistant or Provider not found",
    );
  });

  it("persists partial response on abort", async () => {
    prismaMock.assistant.findUnique.mockResolvedValue(assistantMock);
    chatServiceMock.createMessage
      .mockResolvedValueOnce({
        id: "msg-user",
        topicId: validTopicId,
        content: "hi",
        role: "user",
        parentId: null,
        createdAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: "msg-assistant",
        topicId: validTopicId,
        content: "partial answer",
        role: "assistant",
        parentId: "msg-user",
        createdAt: new Date(),
      });
    chatServiceMock.getTrace.mockResolvedValue([
      {
        id: "msg-user",
        topicId: validTopicId,
        content: "hi",
        role: "user",
        parentId: null,
        createdAt: new Date(),
      },
    ]);
    mcpServiceMock.getToolsForAssistant.mockResolvedValue([]);
    getModelMock.mockReturnValue({});

    const streamResponse = new Response("stream");
    streamTextMock.mockImplementation((options: Record<string, unknown>) => {
      const onChunk = options.onChunk as
        | ((event: { chunk: { type: string; text: string } }) => void)
        | undefined;
      const onAbort = options.onAbort as (() => Promise<void>) | undefined;

      onChunk?.({ chunk: { type: "text-delta", text: "partial answer" } });
      void onAbort?.();

      return {
        toUIMessageStreamResponse: vi.fn().mockReturnValue(streamResponse),
      };
    });

    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        topicId: validTopicId,
        assistantId: "assistant-1",
        message: "hi",
      }),
    });

    const response = await POST(request);

    expect(response).toBe(streamResponse);
    expect(chatServiceMock.createMessage).toHaveBeenNthCalledWith(2, {
      content: "partial answer",
      role: "assistant",
      topicId: validTopicId,
      parentId: "msg-user",
      metadata: { incomplete: true, stopped: true },
    });
  });

  describe("compare mode", () => {
    it("skips user message creation when compareParentId is provided", async () => {
      prismaMock.assistant.findUnique.mockResolvedValue(assistantMock);
      (prismaMock as Record<string, unknown>).message = {
        findUnique: vi.fn().mockResolvedValue({
          id: "existing-user-msg",
          topicId: validTopicId,
          content: "hi",
          role: "user",
          parentId: null,
        }),
      };
      chatServiceMock.getTrace.mockResolvedValue([
        {
          id: "existing-user-msg",
          topicId: validTopicId,
          content: "hi",
          role: "user",
          parentId: null,
          createdAt: new Date(),
        },
      ]);
      mcpServiceMock.getToolsForAssistant.mockResolvedValue([]);
      getModelMock.mockReturnValue({});

      const streamResponse = new Response("stream");
      streamTextMock.mockReturnValue({
        toUIMessageStreamResponse: vi.fn().mockReturnValue(streamResponse),
      });

      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          topicId: validTopicId,
          assistantId: "assistant-1",
          message: "compare this",
          compareParentId: "existing-user-msg",
          compareGroupId: "group-1",
          compareModelId: "gpt-4o",
          compareProviderName: "OpenAI",
        }),
      });

      const response = await POST(request);

      expect(response).toBe(streamResponse);
      // Should NOT create a user message
      expect(chatServiceMock.createMessage).not.toHaveBeenCalled();
      // Should use compareParentId for trace
      expect(chatServiceMock.getTrace).toHaveBeenCalledWith(
        "existing-user-msg",
      );
    });

    it("returns 400 when compareParentId points to non-existent message", async () => {
      (prismaMock as Record<string, unknown>).message = {
        findUnique: vi.fn().mockResolvedValue(null),
      };

      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          topicId: validTopicId,
          assistantId: "assistant-1",
          message: "compare this",
          compareParentId: "non-existent-msg",
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "Compare parent message not found",
      });
    });

    it("writes compare metadata in e2e mock mode", async () => {
      vi.stubEnv("MKCHAT_E2E_MOCK_CHAT", "1");

      prismaMock.assistant.findUnique.mockResolvedValue(assistantMock);
      (prismaMock as Record<string, unknown>).message = {
        findUnique: vi.fn().mockResolvedValue({
          id: "existing-user-msg",
          topicId: validTopicId,
          content: "hi",
          role: "user",
          parentId: null,
        }),
      };
      chatServiceMock.createMessage.mockResolvedValue({
        id: "msg-assistant",
        topicId: validTopicId,
        content: "Mocked reply: compare this",
        role: "assistant",
        parentId: "existing-user-msg",
        createdAt: new Date(),
      });

      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          topicId: validTopicId,
          assistantId: "assistant-1",
          message: "compare this",
          compareParentId: "existing-user-msg",
          compareGroupId: "group-1",
          compareModelId: "gpt-4o",
          compareProviderName: "OpenAI",
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(chatServiceMock.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "assistant",
          parentId: "existing-user-msg",
          metadata: {
            compareGroupId: "group-1",
            compareModelId: "gpt-4o",
            compareProviderName: "OpenAI",
          },
        }),
      );

      vi.unstubAllEnvs();
    });

    it("includes compare metadata in abort handler", async () => {
      prismaMock.assistant.findUnique.mockResolvedValue(assistantMock);
      (prismaMock as Record<string, unknown>).message = {
        findUnique: vi.fn().mockResolvedValue({
          id: "existing-user-msg",
          topicId: validTopicId,
          content: "hi",
          role: "user",
          parentId: null,
        }),
      };
      chatServiceMock.createMessage.mockResolvedValue({
        id: "msg-assistant",
        topicId: validTopicId,
        content: "partial",
        role: "assistant",
        parentId: "existing-user-msg",
        createdAt: new Date(),
      });
      chatServiceMock.getTrace.mockResolvedValue([
        {
          id: "existing-user-msg",
          topicId: validTopicId,
          content: "hi",
          role: "user",
          parentId: null,
          createdAt: new Date(),
        },
      ]);
      mcpServiceMock.getToolsForAssistant.mockResolvedValue([]);
      getModelMock.mockReturnValue({});

      const streamResponse = new Response("stream");
      streamTextMock.mockImplementation((options: Record<string, unknown>) => {
        const onChunk = options.onChunk as
          | ((event: { chunk: { type: string; text: string } }) => void)
          | undefined;
        const onAbort = options.onAbort as (() => Promise<void>) | undefined;

        onChunk?.({ chunk: { type: "text-delta", text: "partial" } });
        void onAbort?.();

        return {
          toUIMessageStreamResponse: vi.fn().mockReturnValue(streamResponse),
        };
      });

      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          topicId: validTopicId,
          assistantId: "assistant-1",
          message: "compare this",
          compareParentId: "existing-user-msg",
          compareGroupId: "group-1",
          compareModelId: "gpt-4o",
          compareProviderName: "OpenAI",
        }),
      });

      await POST(request);

      expect(chatServiceMock.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "assistant",
          metadata: expect.objectContaining({
            incomplete: true,
            stopped: true,
            compareGroupId: "group-1",
            compareModelId: "gpt-4o",
            compareProviderName: "OpenAI",
          }),
        }),
      );
    });
  });

  it("returns mocked stream in e2e mock mode", async () => {
    vi.stubEnv("MKCHAT_E2E_MOCK_CHAT", "1");

    prismaMock.assistant.findUnique.mockResolvedValue(assistantMock);
    chatServiceMock.createMessage
      .mockResolvedValueOnce({
        id: "msg-user",
        topicId: validTopicId,
        content: "hello",
        role: "user",
        parentId: null,
        createdAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: "msg-assistant",
        topicId: validTopicId,
        content: "Mocked reply: hello",
        role: "assistant",
        parentId: "msg-user",
        createdAt: new Date(),
      });

    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        topicId: validTopicId,
        assistantId: "assistant-1",
        message: "hello",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("x-vercel-ai-ui-message-stream")).toBe("v1");
    await expect(response.text()).resolves.toContain("Mocked reply: hello");

    vi.unstubAllEnvs();
  });
});
