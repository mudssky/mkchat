import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const prismaMock = vi.hoisted(() => ({
  topic: {
    findUnique: vi.fn(),
  },
}));

const loggerMock = vi.hoisted(() => ({
  error: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/logger", () => ({
  default: loggerMock,
}));

describe("GET /api/topics/[id]", () => {
  const validId = `c${"a".repeat(24)}`;

  beforeEach(() => {
    prismaMock.topic.findUnique.mockReset();
    loggerMock.error.mockReset();
  });

  it("returns 404 for invalid id", async () => {
    const request = new Request("http://localhost") as unknown as NextRequest;
    const response = await GET(request, {
      params: Promise.resolve({ id: "invalid-id" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid topic id",
    });
  });

  it("returns 404 when topic is missing", async () => {
    prismaMock.topic.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost") as unknown as NextRequest;
    const response = await GET(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Topic not found",
    });
    expect(prismaMock.topic.findUnique).toHaveBeenCalledWith({
      where: { id: validId },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  });

  it("returns topic with messages when found", async () => {
    const topic = {
      id: validId,
      assistantId: "assistant-id",
      title: "Demo",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: "m1",
          topicId: validId,
          content: "Hello",
          role: "user",
          createdAt: new Date(),
          parentId: null,
        },
      ],
    };

    prismaMock.topic.findUnique.mockResolvedValue(topic);

    const request = new Request("http://localhost") as unknown as NextRequest;
    const response = await GET(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(200);
    const expectedPayload = JSON.parse(JSON.stringify({ topic }));
    await expect(response.json()).resolves.toEqual(expectedPayload);
  });

  it("returns 500 on database errors", async () => {
    prismaMock.topic.findUnique.mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost") as unknown as NextRequest;
    const response = await GET(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Internal Server Error",
    });
    expect(loggerMock.error).toHaveBeenCalled();
  });
});
