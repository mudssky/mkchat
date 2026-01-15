import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, PATCH } from "./route";

const prismaMock = vi.hoisted(() => ({
  assistant: {
    findUnique: vi.fn(),
    update: vi.fn(),
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

describe("GET /api/assistants/[id]", () => {
  beforeEach(() => {
    prismaMock.assistant.findUnique.mockReset();
    loggerMock.error.mockReset();
  });

  it("returns assistant detail", async () => {
    prismaMock.assistant.findUnique.mockResolvedValue({
      id: "assistant-1",
      name: "Demo",
      modelId: "model",
      providerConfigId: null,
      systemPrompt: "你好",
    });

    const request = new Request("http://localhost") as unknown as NextRequest;
    const response = await GET(request, {
      params: Promise.resolve({ id: "assistant-1" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      assistant: {
        id: "assistant-1",
        name: "Demo",
        modelId: "model",
        providerConfigId: null,
        systemPrompt: "你好",
      },
    });
  });

  it("returns 404 when assistant is missing", async () => {
    prismaMock.assistant.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost") as unknown as NextRequest;
    const response = await GET(request, {
      params: Promise.resolve({ id: "missing" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Assistant not found",
    });
  });
});

describe("PATCH /api/assistants/[id]", () => {
  beforeEach(() => {
    prismaMock.assistant.findUnique.mockReset();
    prismaMock.assistant.update.mockReset();
    loggerMock.error.mockReset();
  });

  it("returns 400 on invalid payload", async () => {
    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ name: "" }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "assistant-1" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid payload",
    });
  });

  it("returns 404 when assistant is missing", async () => {
    prismaMock.assistant.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Name" }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "assistant-1" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Assistant not found",
    });
  });

  it("updates assistant details", async () => {
    prismaMock.assistant.findUnique.mockResolvedValue({ id: "assistant-1" });
    prismaMock.assistant.update.mockResolvedValue({
      id: "assistant-1",
      name: "New Name",
      modelId: "model",
      providerConfigId: "provider",
      systemPrompt: "Updated",
    });

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Name", systemPrompt: "Updated" }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "assistant-1" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      assistant: {
        id: "assistant-1",
        name: "New Name",
        modelId: "model",
        providerConfigId: "provider",
        systemPrompt: "Updated",
      },
    });
  });

  it("returns 500 on errors", async () => {
    prismaMock.assistant.findUnique.mockRejectedValue(
      new Error("Database error"),
    );

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Name" }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "assistant-1" }),
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Internal Server Error",
    });
    expect(loggerMock.error).toHaveBeenCalled();
  });
});
