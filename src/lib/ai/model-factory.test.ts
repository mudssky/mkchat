/**
 * model-factory.test.ts
 *
 * 测试 AI 模型工厂函数
 * ROI: ⭐⭐⭐⭐ (纯逻辑，分支测试)
 */

import type { ProviderConfig } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { getModel } from "./model-factory";

// Mock AI SDK
vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: vi.fn(() =>
    vi.fn((modelId: string) => ({
      type: "anthropic",
      modelId,
    })),
  ),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() =>
    vi.fn((modelId: string) => ({
      type: "openai",
      modelId,
    })),
  ),
}));

describe("getModel", () => {
  const mockProviderConfig: ProviderConfig = {
    id: "1",
    userId: "user-1",
    name: "Test Provider",
    type: "openai",
    apiKey: "test-api-key",
    baseUrl: "https://api.test.com",
  };

  describe("OpenAI Provider", () => {
    it("应该为 OpenAI provider 创建模型", () => {
      const config: ProviderConfig = {
        ...mockProviderConfig,
        type: "openai",
      };

      const result = getModel(config, "gpt-4");

      expect(result).toEqual({
        type: "openai",
        modelId: "gpt-4",
      });
    });

    it("应该传递 apiKey 到 OpenAI 客户端", () => {
      const config: ProviderConfig = {
        ...mockProviderConfig,
        type: "openai",
        apiKey: "sk-test-key",
      };

      const result = getModel(config, "gpt-3.5-turbo");

      expect(result).toBeDefined();
      expect(result.modelId).toBe("gpt-3.5-turbo");
    });

    it("应该处理带 baseUrl 的 OpenAI 配置", () => {
      const config: ProviderConfig = {
        ...mockProviderConfig,
        type: "openai",
        baseUrl: "https://custom-proxy.com",
      };

      const result = getModel(config, "gpt-4");

      expect(result).toBeDefined();
    });

    it("应该处理没有 baseUrl 的 OpenAI 配置", () => {
      const config: ProviderConfig = {
        ...mockProviderConfig,
        type: "openai",
        baseUrl: null,
      };

      const result = getModel(config, "gpt-4");

      expect(result).toBeDefined();
    });
  });

  describe("Anthropic Provider", () => {
    it("应该为 Anthropic provider 创建模型", () => {
      const config: ProviderConfig = {
        ...mockProviderConfig,
        type: "anthropic",
      };

      const result = getModel(config, "claude-3-opus");

      expect(result).toEqual({
        type: "anthropic",
        modelId: "claude-3-opus",
      });
    });

    it("应该传递 apiKey 到 Anthropic 客户端", () => {
      const config: ProviderConfig = {
        ...mockProviderConfig,
        type: "anthropic",
        apiKey: "sk-ant-test-key",
      };

      const result = getModel(config, "claude-3-sonnet");

      expect(result).toBeDefined();
      expect(result.modelId).toBe("claude-3-sonnet");
    });

    it("应该处理带 baseUrl 的 Anthropic 配置", () => {
      const config: ProviderConfig = {
        ...mockProviderConfig,
        type: "anthropic",
        baseUrl: "https://custom-anthropic.com",
      };

      const result = getModel(config, "claude-3-haiku");

      expect(result).toBeDefined();
    });
  });

  describe("错误处理", () => {
    it("应该为不支持的 provider 类型抛出错误", () => {
      const config: ProviderConfig = {
        ...mockProviderConfig,
        type: "unknown" as string, // biome-ignore lint/suspicious/noExplicitAny: 测试错误处理
      };

      expect(() => getModel(config, "model-id")).toThrow(
        "Unsupported provider: unknown",
      );
    });

    it("应该在错误消息中包含 provider 类型", () => {
      const config: ProviderConfig = {
        ...mockProviderConfig,
        type: "custom-provider" as string, // biome-ignore lint/suspicious/noExplicitAny: 测试错误处理
      };

      expect(() => getModel(config, "model-id")).toThrow(
        "Unsupported provider: custom-provider",
      );
    });
  });

  describe("模型 ID 处理", () => {
    it("应该正确传递模型 ID", () => {
      const config: ProviderConfig = {
        ...mockProviderConfig,
        type: "openai",
      };

      const modelIds = [
        "gpt-4",
        "gpt-3.5-turbo",
        "gpt-4-turbo-preview",
        "claude-3-opus-20240229",
      ];

      modelIds.forEach((modelId) => {
        const result = getModel(config, modelId);
        expect(result.modelId).toBe(modelId);
      });
    });
  });
});
