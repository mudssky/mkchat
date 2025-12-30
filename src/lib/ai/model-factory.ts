import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { ProviderConfig } from '@prisma/client';

export function getModel(providerConfig: ProviderConfig, modelId: string) {
  if (providerConfig.type === 'openai') {
    const openai = createOpenAI({
      apiKey: providerConfig.apiKey,
      baseURL: providerConfig.baseUrl || undefined,
    });
    return openai(modelId);
  }
  
  if (providerConfig.type === 'anthropic') {
    const anthropic = createAnthropic({
      apiKey: providerConfig.apiKey,
      baseURL: providerConfig.baseUrl || undefined,
    });
    return anthropic(modelId);
  }

  throw new Error(`Unsupported provider: ${providerConfig.type}`);
}
