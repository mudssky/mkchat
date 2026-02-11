import type { ProviderConfig } from "@generated/client";
import { generateText } from "ai";
import { getModel } from "@/lib/ai/model-factory";
import logger from "@/lib/logger";

/**
 * 根据 provider 类型选择轻量模型 ID，用于低成本的标题生成任务。
 * 如果 provider 类型未识别，回退到传入的 fallbackModelId。
 */
export function getLightweightModelId(
  providerType: string,
  fallbackModelId: string,
): string {
  switch (providerType) {
    case "openai":
      return "gpt-4o-mini";
    case "anthropic":
      return "claude-haiku-4-20250414";
    default:
      return fallbackModelId;
  }
}

const TITLE_GENERATION_PROMPT =
  "根据以下对话内容生成一个简洁的中文标题（不超过 20 字，只输出标题本身，不要加引号或其他修饰）。";

/**
 * 使用 LLM 为对话生成简短标题。
 * 选择轻量模型以降低成本，失败时回退到 fallbackModelId。
 *
 * @param providerConfig - Provider 配置（含 apiKey、type 等）
 * @param fallbackModelId - 回退模型 ID（通常是 Assistant 配置的 modelId）
 * @param conversationSnippet - 对话前几条消息的文本摘要
 * @returns 生成的标题字符串
 */
export async function generateTopicTitle(
  providerConfig: ProviderConfig,
  fallbackModelId: string,
  conversationSnippet: string,
): Promise<string> {
  const lightModelId = getLightweightModelId(
    providerConfig.type,
    fallbackModelId,
  );

  try {
    const model = getModel(providerConfig, lightModelId);
    const result = await generateText({
      model,
      prompt: `${TITLE_GENERATION_PROMPT}\n\n${conversationSnippet}`,
      maxOutputTokens: 50,
    });

    const title = result.text.trim().replace(/^["'"""'']+|["'"""'']+$/g, "");
    return title.slice(0, 60);
  } catch (error) {
    // 轻量模型失败时，回退到 fallback 模型
    if (lightModelId !== fallbackModelId) {
      logger.warn(
        { error, lightModelId, fallbackModelId },
        "Lightweight model failed for title generation, falling back",
      );

      try {
        const fallbackModel = getModel(providerConfig, fallbackModelId);
        const result = await generateText({
          model: fallbackModel,
          prompt: `${TITLE_GENERATION_PROMPT}\n\n${conversationSnippet}`,
          maxOutputTokens: 50,
        });

        const title = result.text
          .trim()
          .replace(/^["'"""'']+|["'"""'']+$/g, "");
        return title.slice(0, 60);
      } catch (fallbackError) {
        logger.warn(
          { error: fallbackError, fallbackModelId },
          "Fallback model also failed for title generation",
        );
        throw fallbackError;
      }
    }

    throw error;
  }
}
