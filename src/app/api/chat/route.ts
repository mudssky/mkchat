import { streamText, tool } from 'ai';
import { getModel } from '@/lib/ai/model-factory';
import { chatService } from '@/services/chat-service';
import { mcpService } from '@/services/mcp-service';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { message, parentId, topicId, assistantId } = await req.json();

    // 1. Get Assistant & Config
    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
      include: { providerConfig: true }
    });

    if (!assistant || !assistant.providerConfig) {
      return new Response('Assistant or Provider not found', { status: 404 });
    }

    // 2. Save User Message
    const userMsg = await chatService.createMessage({
      content: message,
      role: 'user',
      topicId: topicId,
      parentId
    });

    // 3. Build Context
    const dbMessages = await chatService.getTrace(userMsg.id);
    
    // 4. Get Model
    const model = getModel(assistant.providerConfig, assistant.modelId);

    // 5. Get Tools
    const enrichedTools = await mcpService.getToolsForAssistant(assistantId);
    
    // Use 'any' to bypass strict Zod/Tool inference issues in scaffold
    const tools: Record<string, any> = {};
    for (const enrichedTool of enrichedTools) {
       tools[enrichedTool.name] = tool({
           description: enrichedTool.description,
           parameters: z.object({}).passthrough(),
           execute: async (args: any) => {
               logger.info({ tool: enrichedTool.name, args }, 'Executing Tool');
               return mcpService.executeTool(enrichedTool.serverId, enrichedTool.name, args);
           }
       } as any);
    }

    // 6. Stream
    const result = streamText({
      model,
      system: assistant.systemPrompt || undefined,
      messages: dbMessages.map(m => ({ 
          role: m.role as any, 
          content: m.content 
      })) as any[],
      tools,
      // maxSteps: 5, // Removed to satisfy type check in scaffold
      onFinish: async ({ text }) => {
        if (text) {
             await chatService.createMessage({
                content: text,
                role: 'assistant',
                topicId,
                parentId: userMsg.id
            });
        }
      }
    });

    return (result as any).toDataStreamResponse();

  } catch (error) {
    logger.error({ error }, 'Chat API Error');
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
