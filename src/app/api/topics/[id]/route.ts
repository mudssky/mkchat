import type { NextRequest } from "next/server";
import { z } from "zod";
import { isValidTopicId } from "@/lib/chat/topic-id";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<RouteParams["params"]> },
) {
  const { id: topicId } = await params;

  if (!isValidTopicId(topicId)) {
    return Response.json({ error: "Invalid topic id" }, { status: 404 });
  }

  try {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!topic) {
      return Response.json({ error: "Topic not found" }, { status: 404 });
    }

    return Response.json({ topic });
  } catch (error) {
    logger.error({ error, topicId }, "Topic API Error");
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

const patchBodySchema = z.object({
  title: z.string().min(1, "Title must not be empty"),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<RouteParams["params"]> },
) {
  const { id: topicId } = await params;

  if (!isValidTopicId(topicId)) {
    return Response.json({ error: "Invalid topic id" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = patchBodySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!existing) {
      return Response.json({ error: "Topic not found" }, { status: 404 });
    }

    const updated = await prisma.topic.update({
      where: { id: topicId },
      data: { title: parsed.data.title },
    });

    return Response.json({ topic: updated });
  } catch (error) {
    logger.error({ error, topicId }, "Topic PATCH Error");
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
