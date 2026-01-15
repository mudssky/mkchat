import { type ModelMessage, streamText, type ToolSet, tool } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/model-factory";
import { isValidTopicId } from "@/lib/chat/topic-id";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { chatService } from "@/services/chat-service";
import { mcpService } from "@/services/mcp-service";
import type { ChatMessageMetadata } from "@/types/chat";

export const maxDuration = 60;

const uiPartSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

const uiMessageSchema = z
  .object({
    id: z.string(),
    role: z.enum(["system", "user", "assistant"]),
    parts: z.array(uiPartSchema),
    metadata: z.unknown().optional(),
  })
  .passthrough();

const requestSchema = z.object({
  topicId: z.string(),
  assistantId: z.string(),
  parentId: z.string().nullable().optional(),
  message: z.string().optional(),
  messages: z.array(uiMessageSchema).optional(),
});

type UiMessagePayload = z.infer<typeof uiMessageSchema>;

interface UserMessageExtraction {
  content: string;
  uiMessageId: string;
}

function extractUserMessage(
  messages?: UiMessagePayload[],
): UserMessageExtraction | null {
  if (!messages || messages.length === 0) return null;
  const lastUser = [...messages].reverse().find((msg) => msg.role === "user");
  if (!lastUser) return null;

  const text = lastUser.parts
    .map((part) => {
      if (part.type === "text" && typeof part.text === "string") {
        return part.text;
      }
      if (part.type === "reasoning" && typeof part.text === "string") {
        return part.text;
      }
      return "";
    })
    .join("");

  if (!text.trim()) return null;

  return { content: text, uiMessageId: lastUser.id };
}

function toModelMessages(
  messages: Awaited<ReturnType<typeof chatService.getTrace>>,
) {
  const modelMessages: ModelMessage[] = [];

  for (const message of messages) {
    const role =
      message.role === "user"
        ? "user"
        : message.role === "system"
          ? "system"
          : "assistant";
    modelMessages.push({
      role,
      content: message.content,
    });
  }

  return modelMessages;
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const parsed = requestSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const { topicId, assistantId, parentId, message, messages } = parsed.data;

    if (!isValidTopicId(topicId)) {
      return Response.json({ error: "Invalid topic id" }, { status: 404 });
    }

    const extracted = message
      ? { content: message, uiMessageId: "" }
      : extractUserMessage(messages);
    if (!extracted) {
      return Response.json(
        { error: "Missing message content" },
        { status: 400 },
      );
    }

    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
      include: { providerConfig: true },
    });

    if (!assistant || !assistant.providerConfig) {
      return new Response("Assistant or Provider not found", { status: 404 });
    }

    const userMsg = await chatService.createMessage({
      content: extracted.content,
      role: "user",
      topicId,
      parentId,
    });

    const dbMessages = await chatService.getTrace(userMsg.id);
    const model = getModel(assistant.providerConfig, assistant.modelId);

    const enrichedTools = await mcpService.getToolsForAssistant(assistantId);
    const tools: ToolSet = {};

    for (const enrichedTool of enrichedTools) {
      tools[enrichedTool.name] = tool({
        description: enrichedTool.description,
        inputSchema: z.object({}).passthrough(),
        execute: async (args: Record<string, unknown>) => {
          logger.info({ tool: enrichedTool.name, args }, "Executing Tool");
          return mcpService.executeTool(
            enrichedTool.serverId,
            enrichedTool.name,
            args,
          );
        },
      });
    }

    let partialText = "";
    let didAbort = false;

    const stream = streamText({
      model,
      system: assistant.systemPrompt || undefined,
      messages: toModelMessages(dbMessages),
      tools,
      onChunk: ({ chunk }) => {
        if (chunk.type === "text-delta") {
          partialText += chunk.text;
        }
      },
      onAbort: async () => {
        didAbort = true;
        const content = partialText.trim();
        if (!content) return;

        await chatService.createMessage({
          content,
          role: "assistant",
          topicId,
          parentId: userMsg.id,
          metadata: { incomplete: true, stopped: true },
        });
      },
      onFinish: async ({ text }) => {
        if (didAbort) return;
        if (text) {
          await chatService.createMessage({
            content: text,
            role: "assistant",
            topicId,
            parentId: userMsg.id,
          });
        }
      },
    });

    const assistantMetadata: ChatMessageMetadata = {
      topicId,
      parentId: extracted.uiMessageId || userMsg.id,
      createdAt: new Date().toISOString(),
    };

    return stream.toUIMessageStreamResponse({
      messageMetadata: () => assistantMetadata,
    });
  } catch (error) {
    logger.error({ error }, "Chat API Error");
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
