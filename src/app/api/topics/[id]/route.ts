import type { NextRequest } from "next/server";
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
