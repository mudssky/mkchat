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
});
