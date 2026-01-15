import { z } from "zod";
import type {
  ChatMessage,
  ChatMessageRecordMetadata,
  ChatTopic,
} from "@/types/chat";

const chatMessageRecordMetadataSchema: z.ZodType<ChatMessageRecordMetadata> =
  z.object({
    incomplete: z.boolean().optional(),
    stopped: z.boolean().optional(),
  });

export const chatMessageSchema: z.ZodType<ChatMessage> = z.object({
  id: z.string(),
  topicId: z.string(),
  content: z.string(),
  role: z.enum(["user", "assistant", "system", "tool"]),
  createdAt: z.string(),
  parentId: z.string().nullable(),
  metadata: chatMessageRecordMetadataSchema.nullable().optional(),
});

export const chatTopicSchema: z.ZodType<ChatTopic> = z.object({
  id: z.string(),
  assistantId: z.string(),
  title: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(chatMessageSchema),
});

export interface TopicResponse {
  topic: ChatTopic;
}

export const topicResponseSchema: z.ZodType<TopicResponse> = z.object({
  topic: chatTopicSchema,
});
