import { streamText, tool } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/model-factory";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { chatService } from "@/services/chat-service";
import { mcpService } from "@/services/mcp-service";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { message, parentId, topicId, assistantId } = await req.json();

    // 1. Get Assistant & Config
    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
      include: { providerConfig: true },
    });

    if (!assistant || !assistant.providerConfig) {
      return new Response("Assistant or Provider not found", { status: 404 });
    }

    // 2. Save User Message
    const userMsg = await chatService.createMessage({
      content: message,
      role: "user",
      topicId: topicId,
      parentId,
    });

    // 3. Build Context
    const dbMessages = await chatService.getTrace(userMsg.id);

    // 4. Get Model
    const model = getModel(assistant.providerConfig, assistant.modelId);

    // 5. Get Tools
    const enrichedTools = await mcpService.getToolsForAssistant(assistantId);

    // Use 'any' to bypass strict Zod/Tool inference issues in scaffold
    // biome-ignore lint/suspicious/noExplicitAny: Vercel AI SDK tool 类型推断限制
    const tools: Record<string, any> = {};
    for (const enrichedTool of enrichedTools) {
      tools[enrichedTool.name] = tool({
        description: enrichedTool.description,
        parameters: z.object({}).passthrough(),
        // biome-ignore lint/suspicious/noExplicitAny: MCP 工具参数是动态的
        execute: async (args: any) => {
          logger.info({ tool: enrichedTool.name, args }, "Executing Tool");
          return mcpService.executeTool(
            enrichedTool.serverId,
            enrichedTool.name,
            args,
          );
        },
        // biome-ignore lint/suspicious/noExplicitAny: Vercel AI SDK tool 类型推断限制
      } as any);
    }

    // 6. Stream
    const result = streamText({
      model,
      system: assistant.systemPrompt || undefined,
      messages: dbMessages.map((m) => ({
        // biome-ignore lint/suspicious/noExplicitAny: Vercel AI SDK 消息角色类型不匹配
        role: m.role as any,
        content: m.content,
        // biome-ignore lint/suspicious/noExplicitAny: Vercel AI SDK CoreMessage 类型不匹配
      })) as any[],
      tools,
      // maxSteps: 5, // Removed to satisfy type check in scaffold
      onFinish: async ({ text }) => {
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

    // biome-ignore lint/suspicious/noExplicitAny: toDataStreamResponse 返回类型未导出
    return (result as any).toDataStreamResponse();
  } catch (error) {
    logger.error({ error }, "Chat API Error");
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
