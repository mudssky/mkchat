import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET, PATCH } from "./route";

const prismaMock = vi.hoisted(() => ({
  topic: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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

describe("PATCH /api/topics/[id]", () => {
  const validId = `c${"a".repeat(24)}`;

  beforeEach(() => {
    prismaMock.topic.findUnique.mockReset();
    prismaMock.topic.update.mockReset();
    loggerMock.error.mockReset();
  });

  it("updates title successfully", async () => {
    const updatedTopic = {
      id: validId,
      assistantId: "assistant-id",
      title: "新标题",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.topic.findUnique.mockResolvedValue({ id: validId });
    prismaMock.topic.update.mockResolvedValue(updatedTopic);

    const request = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "新标题" }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.topic.title).toBe("新标题");
    expect(prismaMock.topic.update).toHaveBeenCalledWith({
      where: { id: validId },
      data: { title: "新标题" },
    });
  });

  it("returns 404 for invalid topic id", async () => {
    const request = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "新标题" }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "invalid-id" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid topic id",
    });
  });

  it("returns 404 when topic does not exist", async () => {
    prismaMock.topic.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "新标题" }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Topic not found",
    });
  });

  it("returns 400 for empty title", async () => {
    const request = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "" }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
  });

  it("returns 400 for empty body (no fields)", async () => {
    const request = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(400);
  });

  it("pins a topic", async () => {
    prismaMock.topic.findUnique.mockResolvedValue({
      id: validId,
      pinned: false,
    });
    prismaMock.topic.update.mockResolvedValue({ id: validId, pinned: true });

    const request = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: true }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(200);
    expect(prismaMock.topic.update).toHaveBeenCalledWith({
      where: { id: validId },
      data: { pinned: true },
    });
  });

  it("unpins a topic", async () => {
    prismaMock.topic.findUnique.mockResolvedValue({
      id: validId,
      pinned: true,
    });
    prismaMock.topic.update.mockResolvedValue({ id: validId, pinned: false });

    const request = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: false }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(200);
    expect(prismaMock.topic.update).toHaveBeenCalledWith({
      where: { id: validId },
      data: { pinned: false },
    });
  });

  it("archives a topic", async () => {
    const archiveDate = "2026-02-11T00:00:00.000Z";
    prismaMock.topic.findUnique.mockResolvedValue({
      id: validId,
      archivedAt: null,
    });
    prismaMock.topic.update.mockResolvedValue({
      id: validId,
      archivedAt: archiveDate,
    });

    const request = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archivedAt: archiveDate }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(200);
    expect(prismaMock.topic.update).toHaveBeenCalledWith({
      where: { id: validId },
      data: { archivedAt: new Date(archiveDate) },
    });
  });

  it("unarchives a topic by setting archivedAt to null", async () => {
    prismaMock.topic.findUnique.mockResolvedValue({
      id: validId,
      archivedAt: new Date("2026-02-11"),
    });
    prismaMock.topic.update.mockResolvedValue({
      id: validId,
      archivedAt: null,
    });

    const request = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archivedAt: null }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(200);
    expect(prismaMock.topic.update).toHaveBeenCalledWith({
      where: { id: validId },
      data: { archivedAt: null },
    });
  });

  it("returns 500 on database errors", async () => {
    prismaMock.topic.findUnique.mockResolvedValue({ id: validId });
    prismaMock.topic.update.mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "新标题" }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(500);
    expect(loggerMock.error).toHaveBeenCalled();
  });
});

describe("DELETE /api/topics/[id]", () => {
  const validId = `c${"a".repeat(24)}`;

  beforeEach(() => {
    prismaMock.topic.findUnique.mockReset();
    prismaMock.topic.delete.mockReset();
    loggerMock.error.mockReset();
  });

  it("deletes a topic successfully", async () => {
    prismaMock.topic.findUnique.mockResolvedValue({ id: validId });
    prismaMock.topic.delete.mockResolvedValue({ id: validId });

    const request = new Request("http://localhost", {
      method: "DELETE",
    }) as unknown as NextRequest;

    const response = await DELETE(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(prismaMock.topic.delete).toHaveBeenCalledWith({
      where: { id: validId },
    });
  });

  it("returns 404 when topic does not exist", async () => {
    prismaMock.topic.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost", {
      method: "DELETE",
    }) as unknown as NextRequest;

    const response = await DELETE(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Topic not found",
    });
  });

  it("returns 404 for invalid id", async () => {
    const request = new Request("http://localhost", {
      method: "DELETE",
    }) as unknown as NextRequest;

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "invalid-id" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid topic id",
    });
  });

  it("returns 500 on database errors", async () => {
    prismaMock.topic.findUnique.mockResolvedValue({ id: validId });
    prismaMock.topic.delete.mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost", {
      method: "DELETE",
    }) as unknown as NextRequest;

    const response = await DELETE(request, {
      params: Promise.resolve({ id: validId }),
    });

    expect(response.status).toBe(500);
    expect(loggerMock.error).toHaveBeenCalled();
  });
});
