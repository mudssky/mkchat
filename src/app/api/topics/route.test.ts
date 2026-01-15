import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const prismaMock = vi.hoisted(() => ({
  assistant: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
  },
}));

const chatServiceMock = vi.hoisted(() => ({
  createTopic: vi.fn(),
}));

const loggerMock = vi.hoisted(() => ({
  error: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/services/chat-service", () => ({
  chatService: chatServiceMock,
}));

vi.mock("@/lib/logger", () => ({
  default: loggerMock,
}));

describe("POST /api/topics", () => {
  beforeEach(() => {
    prismaMock.assistant.findFirst.mockReset();
    prismaMock.assistant.findUnique.mockReset();
    chatServiceMock.createTopic.mockReset();
    loggerMock.error.mockReset();
  });

  it("returns 409 when no assistant is available", async () => {
    prismaMock.assistant.findFirst.mockResolvedValue(null);

    const request = new Request("http://localhost/api/topics", {
      method: "POST",
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "No available assistant. Please configure one first.",
    });
  });

  it("returns 404 when specified assistant is missing", async () => {
    prismaMock.assistant.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost/api/topics", {
      method: "POST",
      body: JSON.stringify({ assistantId: "assistant-1" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Assistant not found",
    });
  });

  it("creates a topic with a configured assistant", async () => {
    prismaMock.assistant.findFirst.mockResolvedValue({
      id: "assistant-1",
      providerConfigId: "provider-1",
    });
    chatServiceMock.createTopic.mockResolvedValue({
      id: "topic-1",
      assistantId: "assistant-1",
    });

    const request = new Request("http://localhost/api/topics", {
      method: "POST",
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      topic: {
        id: "topic-1",
        assistantId: "assistant-1",
      },
    });
  });

  it("returns 409 when assistant lacks provider config", async () => {
    prismaMock.assistant.findUnique.mockResolvedValue({
      id: "assistant-1",
      providerConfigId: null,
    });

    const request = new Request("http://localhost/api/topics", {
      method: "POST",
      body: JSON.stringify({ assistantId: "assistant-1" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Assistant is missing provider configuration.",
    });
  });
});
