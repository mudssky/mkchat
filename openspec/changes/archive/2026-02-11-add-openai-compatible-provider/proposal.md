## Why

当前系统仅支持 OpenAI 和 Anthropic 两种原生 Provider。但市场上有大量兼容 OpenAI API 格式的第三方服务（如 DeepSeek、Groq、Together AI、OpenRouter、本地 Ollama 等），它们共享相同的请求/响应协议，只需替换 `baseURL` 和 `apiKey` 即可接入。用户需要一种通用方式配置这些兼容供应商，无需为每个供应商单独编写适配代码。

## What Changes

- 新增 `openai-compatible` Provider 类型，允许用户配置任意 OpenAI 兼容的 API 端点
- 扩展 `model-factory.ts`，使 `openai-compatible` 类型复用 `@ai-sdk/openai` 的 `createOpenAI`，传入用户自定义的 `baseURL`
- 扩展 Provider 表单组件（`provider-form.tsx`），支持选择"OpenAI 兼容"类型，此时 `baseURL` 变为必填项，并增加自定义模型 ID 输入
- 在客户端类型（`types/settings.ts`）和 Zustand store 中增加 `type` 字段以区分 provider 类别
- 扩展 `title-generator.ts` 对 `openai-compatible` 类型的支持

## Capabilities

### New Capabilities
- `openai-compatible-provider`: 覆盖 OpenAI 兼容供应商的配置、创建、验证和使用流程，包括自定义 baseURL、自定义模型 ID、以及通过 `@ai-sdk/openai` 进行实际调用

### Modified Capabilities
- `settings-core`: Provider Configuration 需求扩展——新增对 `openai-compatible` 类型的支持，表单需增加类型选择和必填 baseURL 逻辑

## Impact

- **代码文件**:
  - `src/lib/ai/model-factory.ts` — 增加 `openai-compatible` 分支
  - `src/lib/ai/title-generator.ts` — 增加 `openai-compatible` 的轻量模型映射
  - `src/components/settings/provider-form.tsx` — 扩展表单 UI 和验证逻辑
  - `src/types/settings.ts` — `ProviderConfig` 接口增加 `type` 字段
  - `src/store/settings-store.ts` — 适配新的 type 字段
- **数据库**: Prisma schema 无需修改（`type` 字段已是自由 String）
- **依赖**: 无新增依赖，复用现有 `@ai-sdk/openai`
- **API**: `/api/chat` route 无需修改（已通过 `providerConfig.type` 分发）
