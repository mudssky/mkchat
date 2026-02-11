import type { Prisma } from "@generated/client";
import type { NextRequest } from "next/server";
import { z } from "zod";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { chatService } from "@/services/chat-service";

const querySchema = z.object({
  search: z.string().optional(),
  sort: z.enum(["updatedAt", "createdAt", "title"]).default("updatedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  archived: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  assistantId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = querySchema.safeParse(searchParams);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { search, sort, order, archived, assistantId } = parsed.data;

    const where: Prisma.TopicWhereInput = {};

    // Filter by archive status
    if (archived) {
      where.archivedAt = { not: null };
    } else {
      where.archivedAt = null;
    }

    // Filter by assistantId
    if (assistantId) {
      where.assistantId = assistantId;
    }

    // Search by title (SQLite LIKE is case-insensitive for ASCII by default)
    if (search) {
      where.title = { contains: search };
    }

    // Build orderBy: pinned topics always first, then by sort field
    const orderBy: Prisma.TopicOrderByWithRelationInput[] = [
      { pinned: "desc" },
      { [sort]: order },
    ];

    const topics = await prisma.topic.findMany({
      where,
      orderBy,
      include: {
        assistant: {
          select: {
            name: true,
            modelId: true,
          },
        },
      },
    });

    return Response.json({ topics });
  } catch (error) {
    logger.error({ error }, "Topic list API Error");
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

const requestSchema = z.object({
  assistantId: z.string().optional(),
  title: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    let payload: unknown = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    const parsed = requestSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const { assistantId, title } = parsed.data;

    const assistant = assistantId
      ? await prisma.assistant.findUnique({
          where: { id: assistantId },
        })
      : await prisma.assistant.findFirst({
          where: { providerConfigId: { not: null } },
        });

    if (!assistant) {
      return Response.json(
        {
          error: assistantId
            ? "Assistant not found"
            : "No available assistant. Please configure one first.",
        },
        { status: assistantId ? 404 : 409 },
      );
    }

    if (!assistant.providerConfigId) {
      return Response.json(
        { error: "Assistant is missing provider configuration." },
        { status: 409 },
      );
    }

    const topic = await chatService.createTopic(assistant.id, title);

    return Response.json({ topic }, { status: 201 });
  } catch (error) {
    logger.error({ error }, "Topic create API Error");
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
