## Context

当前 `model-factory.ts` 通过 `providerConfig.type` 字段区分 `"openai"` 和 `"anthropic"` 两种 Provider，分别调用 `@ai-sdk/openai` 和 `@ai-sdk/anthropic`。Prisma 的 `ProviderConfig.type` 是自由 String，已预留扩展空间。

客户端 `ProviderConfig` 类型（`src/types/settings.ts`）缺少 `type` 字段，与 Prisma 生成的类型存在结构差异。Provider 表单（`provider-form.tsx`）的 `predefinedProviders` 数组硬编码了 OpenAI 和 Anthropic 两项，选择后自动填充 `defaultEndpoint`。

`@ai-sdk/openai` 的 `createOpenAI` 本身就支持自定义 `baseURL`，这意味着所有 OpenAI 兼容服务只需传入不同的 `baseURL` + `apiKey` 即可工作，无需额外适配层。

## Goals / Non-Goals

**Goals:**
- 用户可在 Settings 中添加任意 OpenAI 兼容供应商（如 DeepSeek、Groq、OpenRouter、本地 Ollama）
- `baseURL` 在 `openai-compatible` 类型下为必填项
- 用户可自定义模型 ID（因第三方服务的模型名称各异）
- 复用现有 `@ai-sdk/openai` SDK，零新增依赖
- 标题生成（`title-generator.ts`）对 `openai-compatible` 类型做合理回退

**Non-Goals:**
- 不为每个第三方服务（DeepSeek、Groq 等）单独编写适配代码
- 不实现模型列表自动发现（如 `/v1/models` API 探测），用户需手动输入模型 ID
- 不实现 Provider 连接测试（可作为后续功能）
- 不改动 Prisma schema（`type` 已是自由 String）
- 不统一客户端和 Prisma 两套 ProviderConfig 类型（属于独立重构范围）

## Decisions

### Decision 1: 新增 `openai-compatible` 作为独立 type 值

**选择**: 在 `model-factory.ts` 中增加 `"openai-compatible"` 分支，与 `"openai"` 分支逻辑一致（都调用 `createOpenAI`），但语义上区分原生 OpenAI 和第三方兼容服务。

**替代方案**:
- 方案 A: 直接让用户在 `"openai"` 类型下修改 `baseURL` → 不够直观，用户可能不理解为什么选 "OpenAI" 来配置 DeepSeek
- 方案 B: 每个第三方服务一个 type（`"deepseek"`, `"groq"` 等）→ 维护成本高，需不断添加

**理由**: 清晰的语义分离 + 最小改动 + 无限扩展。

### Decision 2: 在客户端 ProviderConfig 类型中增加 `type` 字段

**选择**: 在 `src/types/settings.ts` 的 `ProviderConfig` 接口中增加 `type: string` 字段，并在 `provider-form.tsx` 中使用它来控制表单行为。

**理由**: 需要在客户端区分 provider 类别以驱动不同的表单验证逻辑（如 `openai-compatible` 时 `baseURL` 必填）。

### Decision 3: 表单扩展策略

**选择**: 在 `predefinedProviders` 数组中新增 `{ name: "openai-compatible", label: "OpenAI 兼容", defaultEndpoint: "" }` 项。当选择此项时：
- `baseURL` 字段变为必填
- 增加自定义"名称"输入框（允许用户命名为 "DeepSeek", "Groq" 等）
- 增加自定义"模型 ID"输入框

**理由**: 最小化 UI 改动，复用现有表单结构。

### Decision 4: title-generator.ts 回退策略

**选择**: 对 `openai-compatible` 类型，在 `getLightweightModelId` 中使用用户配置的模型 ID 本身作为标题生成模型（因为无法预知第三方服务有哪些轻量模型）。若失败，则跳过标题生成。

**替代方案**: 尝试固定使用 `"gpt-4o-mini"` → 第三方服务可能不支持此模型

**理由**: 安全回退优于强制假设。

## Risks / Trade-offs

- **[Risk] 第三方服务不完全兼容 OpenAI API** → 这是用户选择的兼容服务的固有风险，不在本项目控制范围。文档提示即可。
- **[Risk] 用户输入错误的 baseURL 或模型 ID** → 调用时报错会通过流式响应返回给用户。后续可增加连接测试功能。
- **[Trade-off] 不自动发现模型列表** → 减少复杂度，但增加用户配置负担。可作为后续增强。
