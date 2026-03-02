import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "./route";

const prismaMock = vi.hoisted(() => ({
  message: {
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

function makeRequest(id: string, body: unknown) {
  return new Request(`http://localhost/api/messages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("PATCH /api/messages/[id]", () => {
  beforeEach(() => {
    prismaMock.message.findUnique.mockReset();
    prismaMock.message.update.mockReset();
    loggerMock.error.mockReset();
  });

  it("returns 400 on invalid body", async () => {
    const response = await PATCH(
      makeRequest("msg-1", { bad: true }),
      makeParams("msg-1"),
    );
    expect(response.status).toBe(400);
  });

  it("returns 404 when message not found", async () => {
    prismaMock.message.findUnique.mockResolvedValue(null);

    const response = await PATCH(
      makeRequest("msg-1", { metadata: { vote: "up" } }),
      makeParams("msg-1"),
    );
    expect(response.status).toBe(404);
  });

  it("merges metadata with existing values", async () => {
    prismaMock.message.findUnique.mockResolvedValue({
      id: "msg-1",
      metadata: { compareGroupId: "g1", compareModelId: "gpt-4o" },
    });
    prismaMock.message.update.mockResolvedValue({
      id: "msg-1",
      metadata: { compareGroupId: "g1", compareModelId: "gpt-4o", vote: "up" },
    });

    const response = await PATCH(
      makeRequest("msg-1", { metadata: { vote: "up" } }),
      makeParams("msg-1"),
    );

    expect(response.status).toBe(200);
    expect(prismaMock.message.update).toHaveBeenCalledWith({
      where: { id: "msg-1" },
      data: {
        metadata: {
          compareGroupId: "g1",
          compareModelId: "gpt-4o",
          vote: "up",
        },
      },
    });
  });

  it("removes null values from metadata (unset vote)", async () => {
    prismaMock.message.findUnique.mockResolvedValue({
      id: "msg-1",
      metadata: { compareGroupId: "g1", vote: "up" },
    });
    prismaMock.message.update.mockResolvedValue({
      id: "msg-1",
      metadata: { compareGroupId: "g1" },
    });

    const response = await PATCH(
      makeRequest("msg-1", { metadata: { vote: null } }),
      makeParams("msg-1"),
    );

    expect(response.status).toBe(200);
    expect(prismaMock.message.update).toHaveBeenCalledWith({
      where: { id: "msg-1" },
      data: {
        metadata: { compareGroupId: "g1" },
      },
    });
  });

  it("handles message with no existing metadata", async () => {
    prismaMock.message.findUnique.mockResolvedValue({
      id: "msg-1",
      metadata: null,
    });
    prismaMock.message.update.mockResolvedValue({
      id: "msg-1",
      metadata: { vote: "down" },
    });

    const response = await PATCH(
      makeRequest("msg-1", { metadata: { vote: "down" } }),
      makeParams("msg-1"),
    );

    expect(response.status).toBe(200);
    expect(prismaMock.message.update).toHaveBeenCalledWith({
      where: { id: "msg-1" },
      data: {
        metadata: { vote: "down" },
      },
    });
  });
});
