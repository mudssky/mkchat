import { z } from "zod";
import type {
  AssistantDetail,
  AssistantSummary,
  AssistantTopicSummary,
} from "@/types/chat";

export const assistantTopicSchema: z.ZodType<AssistantTopicSummary> = z.object({
  id: z.string(),
  title: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const assistantSummarySchema: z.ZodType<AssistantSummary> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  modelId: z.string(),
  providerConfigId: z.string().nullable(),
  topics: z.array(assistantTopicSchema),
});

export interface AssistantListResponse {
  assistants: AssistantSummary[];
}

export const assistantListResponseSchema: z.ZodType<AssistantListResponse> =
  z.object({
    assistants: z.array(assistantSummarySchema),
  });

export const assistantDetailSchema: z.ZodType<AssistantDetail> = z.object({
  id: z.string(),
  name: z.string(),
  modelId: z.string(),
  providerConfigId: z.string().nullable(),
  systemPrompt: z.string(),
});

export const assistantDetailResponseSchema: z.ZodType<{
  assistant: AssistantDetail;
}> = z.object({
  assistant: assistantDetailSchema,
});
