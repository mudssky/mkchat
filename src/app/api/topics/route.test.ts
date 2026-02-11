import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

const prismaMock = vi.hoisted(() => ({
  assistant: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
  },
  topic: {
    findMany: vi.fn(),
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

const makeGetRequest = (params: Record<string, string> = {}) => {
  const url = new URL("http://localhost/api/topics");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
};

describe("GET /api/topics", () => {
  beforeEach(() => {
    prismaMock.topic.findMany.mockReset();
    loggerMock.error.mockReset();
  });

  it("returns active topics with default sorting", async () => {
    const topics = [
      {
        id: "t1",
        title: "Topic 1",
        pinned: true,
        archivedAt: null,
        updatedAt: new Date(),
        assistant: { name: "Assistant 1", modelId: "gpt-4" },
      },
      {
        id: "t2",
        title: "Topic 2",
        pinned: false,
        archivedAt: null,
        updatedAt: new Date(),
        assistant: { name: "Assistant 1", modelId: "gpt-4" },
      },
    ];
    prismaMock.topic.findMany.mockResolvedValue(topics);

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.topics).toHaveLength(2);
    expect(prismaMock.topic.findMany).toHaveBeenCalledWith({
      where: { archivedAt: null },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      include: {
        assistant: { select: { name: true, modelId: true } },
      },
    });
  });

  it("filters by search query", async () => {
    prismaMock.topic.findMany.mockResolvedValue([]);

    await GET(makeGetRequest({ search: "TypeScript" }));

    expect(prismaMock.topic.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          title: { contains: "TypeScript" },
        }),
      }),
    );
  });

  it("returns archived topics when archived=true", async () => {
    prismaMock.topic.findMany.mockResolvedValue([]);

    await GET(makeGetRequest({ archived: "true" }));

    expect(prismaMock.topic.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          archivedAt: { not: null },
        }),
      }),
    );
  });

  it("filters by assistantId", async () => {
    prismaMock.topic.findMany.mockResolvedValue([]);

    await GET(makeGetRequest({ assistantId: "a1" }));

    expect(prismaMock.topic.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          assistantId: "a1",
        }),
      }),
    );
  });

  it("supports custom sort and order", async () => {
    prismaMock.topic.findMany.mockResolvedValue([]);

    await GET(makeGetRequest({ sort: "createdAt", order: "asc" }));

    expect(prismaMock.topic.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ pinned: "desc" }, { createdAt: "asc" }],
      }),
    );
  });

  it("supports title sort", async () => {
    prismaMock.topic.findMany.mockResolvedValue([]);

    await GET(makeGetRequest({ sort: "title", order: "asc" }));

    expect(prismaMock.topic.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ pinned: "desc" }, { title: "asc" }],
      }),
    );
  });

  it("returns 500 on database errors", async () => {
    prismaMock.topic.findMany.mockRejectedValue(new Error("DB error"));

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(500);
    expect(loggerMock.error).toHaveBeenCalled();
  });
});

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
