import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateTopicTitle, getLightweightModelId } from "./title-generator";

const generateTextMock = vi.hoisted(() => vi.fn());
const getModelMock = vi.hoisted(() => vi.fn());
const loggerMock = vi.hoisted(() => ({
  warn: vi.fn(),
}));

vi.mock("ai", () => ({
  generateText: generateTextMock,
}));

vi.mock("@/lib/ai/model-factory", () => ({
  getModel: getModelMock,
}));

vi.mock("@/lib/logger", () => ({
  default: loggerMock,
}));

const mockProviderConfig = {
  id: "provider-1",
  userId: "user-1",
  name: "Test Provider",
  type: "openai",
  apiKey: "sk-test",
  baseUrl: null,
  enabled: true,
};

describe("getLightweightModelId", () => {
  it("returns gpt-4o-mini for openai", () => {
    expect(getLightweightModelId("openai", "gpt-4o")).toBe("gpt-4o-mini");
  });

  it("returns claude-haiku for anthropic", () => {
    expect(getLightweightModelId("anthropic", "claude-sonnet-4-20250514")).toBe(
      "claude-haiku-4-20250414",
    );
  });

  it("returns fallback for unknown provider", () => {
    expect(getLightweightModelId("deepseek", "deepseek-chat")).toBe(
      "deepseek-chat",
    );
  });
});

describe("generateTopicTitle", () => {
  const fakeModel = { id: "fake-model" };

  beforeEach(() => {
    generateTextMock.mockReset();
    getModelMock.mockReset();
    loggerMock.warn.mockReset();
    getModelMock.mockReturnValue(fakeModel);
  });

  it("generates title using lightweight model", async () => {
    generateTextMock.mockResolvedValue({ text: "关于 TypeScript 的讨论" });

    const result = await generateTopicTitle(
      mockProviderConfig,
      "gpt-4o",
      "User: 什么是 TypeScript?\nAssistant: TypeScript 是...",
    );

    expect(result).toBe("关于 TypeScript 的讨论");
    expect(getModelMock).toHaveBeenCalledWith(
      mockProviderConfig,
      "gpt-4o-mini",
    );
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: fakeModel,
        maxOutputTokens: 50,
      }),
    );
  });

  it("strips surrounding quotes from generated title", async () => {
    generateTextMock.mockResolvedValue({ text: '"关于测试的讨论"' });

    const result = await generateTopicTitle(
      mockProviderConfig,
      "gpt-4o",
      "conversation",
    );

    expect(result).toBe("关于测试的讨论");
  });

  it("truncates title to 60 chars", async () => {
    const longTitle =
      "这是一个非常非常非常非常非常非常非常非常非常非常非常非常非常长的标题应该被截断";
    generateTextMock.mockResolvedValue({ text: longTitle });

    const result = await generateTopicTitle(
      mockProviderConfig,
      "gpt-4o",
      "conversation",
    );

    expect(result.length).toBeLessThanOrEqual(60);
  });

  it("falls back to original model when lightweight model fails", async () => {
    const lightModel = { id: "light" };
    const fallbackModel = { id: "fallback" };

    getModelMock
      .mockReturnValueOnce(lightModel)
      .mockReturnValueOnce(fallbackModel);

    generateTextMock
      .mockRejectedValueOnce(new Error("Model not found"))
      .mockResolvedValueOnce({ text: "回退标题" });

    const result = await generateTopicTitle(
      mockProviderConfig,
      "gpt-4o",
      "conversation",
    );

    expect(result).toBe("回退标题");
    expect(loggerMock.warn).toHaveBeenCalled();
    expect(getModelMock).toHaveBeenCalledTimes(2);
  });

  it("throws when both lightweight and fallback models fail", async () => {
    generateTextMock.mockRejectedValue(new Error("API error"));

    await expect(
      generateTopicTitle(mockProviderConfig, "gpt-4o", "conversation"),
    ).rejects.toThrow("API error");
  });

  it("does not fallback when provider type is unknown (same model)", async () => {
    const unknownProvider = { ...mockProviderConfig, type: "deepseek" };
    generateTextMock.mockRejectedValue(new Error("Unavailable"));

    await expect(
      generateTopicTitle(unknownProvider, "deepseek-chat", "conversation"),
    ).rejects.toThrow("Unavailable");

    // 不应尝试回退，因为 lightweight == fallback
    expect(getModelMock).toHaveBeenCalledTimes(1);
  });
});
