import type { Prisma } from "@generated/client";

export type ChatRole = "user" | "assistant" | "system" | "tool";

export type ChatMessageRecordMetadata = Prisma.JsonObject & {
  incomplete?: boolean;
  stopped?: boolean;
  compareGroupId?: string;
  compareModelId?: string;
  compareProviderName?: string;
  vote?: "up" | "down" | null;
};

export interface ChatMessage {
  id: string;
  topicId: string;
  content: string;
  role: ChatRole;
  createdAt: string;
  parentId: string | null;
  metadata?: ChatMessageRecordMetadata | null;
}

export interface ChatMessageMetadata {
  topicId: string;
  parentId: string | null;
  createdAt: string;
  incomplete?: boolean;
  stopped?: boolean;
  compareGroupId?: string;
  compareModelId?: string;
  compareProviderName?: string;
}

export interface AssistantTopicSummary {
  id: string;
  title?: string | null;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  archivedAt: string | null;
}

export interface AssistantSummary {
  id: string;
  name: string;
  description?: string | null;
  modelId: string;
  providerConfigId: string | null;
  providerName?: string | null;
  topics: AssistantTopicSummary[];
}

export interface AssistantDetail {
  id: string;
  name: string;
  modelId: string;
  providerConfigId: string | null;
  systemPrompt: string;
}

export interface ChatTopic {
  id: string;
  assistantId: string;
  title?: string | null;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  archivedAt: string | null;
  messages: ChatMessage[];
}
