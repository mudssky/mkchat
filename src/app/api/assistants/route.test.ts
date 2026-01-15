import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const prismaMock = vi.hoisted(() => ({
  assistant: {
    findMany: vi.fn(),
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

describe("GET /api/assistants", () => {
  beforeEach(() => {
    prismaMock.assistant.findMany.mockReset();
    loggerMock.error.mockReset();
  });

  it("returns assistant list", async () => {
    prismaMock.assistant.findMany.mockResolvedValue([
      {
        id: "assistant-1",
        name: "Demo",
        systemPrompt: "你是一个很棒的助手。",
        modelId: "model",
        providerConfigId: "provider",
        topics: [
          {
            id: "topic-1",
            title: "First",
            createdAt: new Date("2024-01-01T00:00:00Z"),
            updatedAt: new Date("2024-01-02T00:00:00Z"),
          },
        ],
      },
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.assistants).toHaveLength(1);
    expect(payload.assistants[0].name).toBe("Demo");
    expect(payload.assistants[0].description).toBe("你是一个很棒的助手。");
  });

  it("returns 500 on errors", async () => {
    prismaMock.assistant.findMany.mockRejectedValue(
      new Error("Database error"),
    );

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Internal Server Error",
    });
    expect(loggerMock.error).toHaveBeenCalled();
  });
});
