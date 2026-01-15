import { z } from "zod";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { chatService } from "@/services/chat-service";

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
