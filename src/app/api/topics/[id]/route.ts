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
  title: z.string().min(1, "Title must not be empty").optional(),
  pinned: z.boolean().optional(),
  archivedAt: z.string().datetime().nullable().optional(),
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

    // Require at least one field
    const { title, pinned, archivedAt } = parsed.data;
    if (
      title === undefined &&
      pinned === undefined &&
      archivedAt === undefined
    ) {
      return Response.json(
        {
          error: "Validation failed",
          details: { formErrors: ["At least one field is required"] },
        },
        { status: 400 },
      );
    }

    const existing = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!existing) {
      return Response.json({ error: "Topic not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (pinned !== undefined) data.pinned = pinned;
    if (archivedAt !== undefined) {
      data.archivedAt = archivedAt ? new Date(archivedAt) : null;
    }

    const updated = await prisma.topic.update({
      where: { id: topicId },
      data,
    });

    return Response.json({ topic: updated });
  } catch (error) {
    logger.error({ error, topicId }, "Topic PATCH Error");
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<RouteParams["params"]> },
) {
  const { id: topicId } = await params;

  if (!isValidTopicId(topicId)) {
    return Response.json({ error: "Invalid topic id" }, { status: 404 });
  }

  try {
    const existing = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!existing) {
      return Response.json({ error: "Topic not found" }, { status: 404 });
    }

    await prisma.topic.delete({
      where: { id: topicId },
    });

    return Response.json({ success: true });
  } catch (error) {
    logger.error({ error, topicId }, "Topic DELETE Error");
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
