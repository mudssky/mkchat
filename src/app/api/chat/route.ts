import { type ModelMessage, streamText, type ToolSet, tool } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/model-factory";
import { generateTopicTitle } from "@/lib/ai/title-generator";
import { isValidTopicId } from "@/lib/chat/topic-id";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { chatService } from "@/services/chat-service";
import { mcpService } from "@/services/mcp-service";
import type {
  ChatMessageMetadata,
  ChatMessageRecordMetadata,
} from "@/types/chat";

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
  compareParentId: z.string().optional(),
  compareGroupId: z.string().optional(),
  compareModelId: z.string().optional(),
  compareProviderName: z.string().optional(),
});

type UiMessagePayload = z.infer<typeof uiMessageSchema>;

interface UserMessageExtraction {
  content: string;
  uiMessageId: string;
}

function isE2eChatMockEnabled() {
  return process.env.MKCHAT_E2E_MOCK_CHAT === "1";
}

function createMockUIMessageStreamResponse(
  messageId: string,
  text: string,
  metadata: ChatMessageMetadata,
) {
  const textPartId = `text-${messageId}`;
  const chunks = [
    { type: "start", messageId, messageMetadata: metadata },
    { type: "start-step" },
    { type: "text-start", id: textPartId },
    { type: "text-delta", id: textPartId, delta: text },
    { type: "text-end", id: textPartId },
    { type: "finish-step" },
    { type: "finish", finishReason: "stop", messageMetadata: metadata },
  ];

  const body = `${chunks
    .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
    .join("")}data: [DONE]\n\n`;

  return new Response(body, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
      "x-vercel-ai-ui-message-stream": "v1",
    },
  });
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

    const {
      topicId,
      assistantId,
      parentId,
      message,
      messages,
      compareParentId,
      compareGroupId,
      compareModelId,
      compareProviderName,
    } = parsed.data;

    const isCompareMode = !!compareParentId;

    if (!isValidTopicId(topicId)) {
      return Response.json({ error: "Invalid topic id" }, { status: 404 });
    }

    // In compare mode with compareParentId, validate that the parent message exists
    if (isCompareMode) {
      const parentMsg = await prisma.message.findUnique({
        where: { id: compareParentId },
      });
      if (!parentMsg) {
        return Response.json(
          { error: "Compare parent message not found" },
          { status: 400 },
        );
      }
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

    // In compare mode: skip user message creation, use compareParentId as parent
    // In normal mode: create user message as usual
    let userMsgId: string;
    if (isCompareMode) {
      userMsgId = compareParentId;
    } else {
      const userMsg = await chatService.createMessage({
        content: extracted.content,
        role: "user",
        topicId,
        parentId,
      });
      userMsgId = userMsg.id;
    }

    if (isE2eChatMockEnabled()) {
      const mockText = `Mocked reply: ${extracted.content}`;
      const compareMetadata: ChatMessageRecordMetadata = {};
      if (isCompareMode) {
        if (compareGroupId) compareMetadata.compareGroupId = compareGroupId;
        if (compareModelId) compareMetadata.compareModelId = compareModelId;
        if (compareProviderName)
          compareMetadata.compareProviderName = compareProviderName;
      }

      const assistantMsg = await chatService.createMessage({
        content: mockText,
        role: "assistant",
        topicId,
        parentId: userMsgId,
        metadata:
          Object.keys(compareMetadata).length > 0 ? compareMetadata : undefined,
      });

      const metadata: ChatMessageMetadata = {
        topicId,
        parentId: extracted.uiMessageId || userMsgId,
        createdAt: new Date().toISOString(),
        ...(compareGroupId && { compareGroupId }),
        ...(compareModelId && { compareModelId }),
        ...(compareProviderName && { compareProviderName }),
      };

      return createMockUIMessageStreamResponse(
        assistantMsg.id,
        mockText,
        metadata,
      );
    }

    const dbMessages = await chatService.getTrace(userMsgId);
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

    const compareRecordMetadata: ChatMessageRecordMetadata = {};
    if (isCompareMode) {
      if (compareGroupId) compareRecordMetadata.compareGroupId = compareGroupId;
      if (compareModelId) compareRecordMetadata.compareModelId = compareModelId;
      if (compareProviderName)
        compareRecordMetadata.compareProviderName = compareProviderName;
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
          parentId: userMsgId,
          metadata: {
            incomplete: true,
            stopped: true,
            ...compareRecordMetadata,
          },
        });
      },
      onFinish: async ({ text }) => {
        if (didAbort) return;
        if (text) {
          await chatService.createMessage({
            content: text,
            role: "assistant",
            topicId,
            parentId: userMsgId,
            metadata:
              Object.keys(compareRecordMetadata).length > 0
                ? compareRecordMetadata
                : undefined,
          });
        }

        // Fire-and-forget: 自动生成对话标题（仅首次，非对比模式）
        if (!isE2eChatMockEnabled() && text && !isCompareMode) {
          void (async () => {
            try {
              const topic = await prisma.topic.findUnique({
                where: { id: topicId },
                select: { title: true },
              });

              if (topic?.title) return; // 已有标题，跳过

              const snippet = `User: ${extracted.content}\nAssistant: ${text.slice(0, 500)}`;
              const title = await generateTopicTitle(
                assistant.providerConfig!,
                assistant.modelId,
                snippet,
              );

              if (title) {
                await prisma.topic.update({
                  where: { id: topicId },
                  data: { title },
                });
                logger.info({ topicId, title }, "Auto-generated topic title");
              }
            } catch (titleError) {
              logger.warn(
                { error: titleError, topicId },
                "Failed to auto-generate topic title",
              );
            }
          })();
        }
      },
    });

    const assistantMetadata: ChatMessageMetadata = {
      topicId,
      parentId: extracted.uiMessageId || userMsgId,
      createdAt: new Date().toISOString(),
      ...(compareGroupId && { compareGroupId }),
      ...(compareModelId && { compareModelId }),
      ...(compareProviderName && { compareProviderName }),
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
