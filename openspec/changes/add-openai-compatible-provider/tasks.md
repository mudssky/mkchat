## 1. 类型系统扩展

- [x] 1.1 在 `src/types/settings.ts` 的 `ProviderConfig` 接口中增加 `type` 字段（`type: 'openai' | 'anthropic' | 'openai-compatible'`）
- [x] 1.2 在 `src/store/settings-store.ts` 中确保 `upsertProvider` 等方法正确处理新的 `type` 字段，已有 Provider 数据迁移兼容（默认根据 `name` 推导 `type`）

## 2. Model Factory 扩展

- [x] 2.1 在 `src/lib/ai/model-factory.ts` 的 `getModel()` 中增加 `"openai-compatible"` 分支，复用 `createOpenAI({ apiKey, baseURL })`
- [x] 2.2 在 `src/lib/ai/title-generator.ts` 中增加 `"openai-compatible"` 的回退逻辑（使用 Assistant 配置的 modelId，失败时静默降级）

## 3. Provider 表单 UI 扩展

- [x] 3.1 在 `src/components/settings/provider-form.tsx` 的 `predefinedProviders` 数组中新增 `{ name: "openai-compatible", label: "OpenAI 兼容", defaultEndpoint: "" }` 条目
- [x] 3.2 当选择 `openai-compatible` 时，显示自定义名称输入框（displayName），`baseURL` 变为必填，增加表单校验逻辑
- [x] 3.3 当选择 `openai-compatible` 时，增加自定义模型 ID 输入区域（逗号分隔或逐个添加），写入 `models` 数组

## 4. Settings 页面适配

- [x] 4.1 在 `src/app/(main)/settings/providers/page.tsx` 的 Provider 列表卡片中正确显示 `openai-compatible` 类型的 Provider（显示自定义名称 + 类型标签 "OpenAI 兼容"）

## 5. 测试

- [x] 5.1 为 `model-factory.ts` 编写单元测试：验证 `"openai-compatible"` 类型正确调用 `createOpenAI` 并传入 `baseURL`
- [x] 5.2 为 `title-generator.ts` 编写单元测试：验证 `"openai-compatible"` 类型的回退逻辑
- [x] 5.3 为 `provider-form.tsx` 编写冒烟测试：验证表单在选择 `openai-compatible` 时正确显示必填字段
- [x] 5.4 运行 `pnpm qa` 确认全部通过
