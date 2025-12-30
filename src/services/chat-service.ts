import type { Message } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class ChatService {
  /**
   * Retrieves the message trace from a leaf node up to the root, returning chronologically ordered messages.
   */
  async getTrace(leafMessageId: string): Promise<Message[]> {
    const trace: Message[] = [];

    // Use a loop to traverse up.
    // Optimization: Recursive CTE is better in SQL, but for Prisma/SQLite loop is fine for reasonable depth.
    // Or fetch all messages for topic and build tree in memory?
    // Fetching 100 messages is faster than 100 queries.
    // But verify if we know the topicId? Yes, we can fetch the first message to get topicId.

    const leaf = await prisma.message.findUnique({
      where: { id: leafMessageId },
    });
    if (!leaf) return [];

    // Strategy: Fetch all messages in the topic, then traverse in memory.
    const allMessages = await prisma.message.findMany({
      where: { topicId: leaf.topicId },
    });

    const msgMap = new Map(allMessages.map((m: Message) => [m.id, m]));

    let current: Message | undefined = msgMap.get(leafMessageId);
    while (current) {
      trace.push(current);
      if (current.parentId) {
        current = msgMap.get(current.parentId);
      } else {
        current = undefined;
      }
    }

    return trace.reverse();
  }

  /**
   * Create a new message node.
   * If parentId is provided, acts as a reply/branch.
   * If no parentId, usually starts a new root (requires valid topicId).
   */
  async createMessage(data: {
    content: string;
    role: string;
    topicId: string;
    parentId?: string | null;
  }) {
    return prisma.message.create({
      data: {
        content: data.content,
        role: data.role,
        topicId: data.topicId,
        parentId: data.parentId,
      },
    });
  }

  /*
   * Helper to create a new Topic with an initial message
   */
  async createTopic(assistantId: string, title?: string) {
    return prisma.topic.create({
      data: {
        assistantId,
        title: title || "New Chat",
      },
    });
  }

  /**
   * Get the latest leaf message for a topic (if linear).
   * For trees, "latest" is ambiguous. Usually we track "current leaf" in UI state.
   * But logic might need "last created message in topic".
   */
  async getLatestMessage(topicId: string) {
    return prisma.message.findFirst({
      where: { topicId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const chatService = new ChatService();
