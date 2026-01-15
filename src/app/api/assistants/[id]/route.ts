import type { NextRequest } from "next/server";
import { z } from "zod";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const assistantUpdateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    modelId: z.string().trim().min(1).optional(),
    systemPrompt: z.string().optional(),
  })
  .strict();

const assistantSelect = {
  id: true,
  name: true,
  modelId: true,
  providerConfigId: true,
  systemPrompt: true,
} as const;

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<RouteParams["params"]> },
) {
  const { id } = await params;
  try {
    const assistant = await prisma.assistant.findUnique({
      where: { id },
      select: assistantSelect,
    });

    if (!assistant) {
      return Response.json({ error: "Assistant not found" }, { status: 404 });
    }

    return Response.json({ assistant });
  } catch (error) {
    logger.error({ error }, "Assistant detail API Error");
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams["params"]> },
) {
  const { id } = await params;
  try {
    const payload = await request.json().catch(() => null);
    const parsed = assistantUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (Object.keys(parsed.data).length === 0) {
      return Response.json({ error: "No updates provided" }, { status: 400 });
    }

    const existing = await prisma.assistant.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return Response.json({ error: "Assistant not found" }, { status: 404 });
    }

    const assistant = await prisma.assistant.update({
      where: { id },
      data: parsed.data,
      select: assistantSelect,
    });

    return Response.json({ assistant });
  } catch (error) {
    logger.error({ error }, "Assistant update API Error");
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
