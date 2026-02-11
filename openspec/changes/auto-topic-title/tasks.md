# Tasks: auto-topic-title

## 1. Topic PATCH API

- [x] 1.1 在 `src/app/api/topics/[id]/route.ts` 中新增 `PATCH` handler，支持 `{ title: string }` body，使用 Zod 校验（非空字符串），更新 `Topic.title` 并返回更新后的 Topic
- [x] 1.2 编写 PATCH handler 的单元测试：正常更新 / 404 / 空标题 400

## 2. 标题生成服务

- [x] 2.1 创建 `src/lib/ai/title-generator.ts`，导出 `generateTopicTitle(providerConfig, messages): Promise<string>` 函数。使用 `generateText` API（非流式），Prompt 为"根据以下对话内容生成一个简洁的中文标题（不超过 20 字，只输出标题本身）"
- [x] 2.2 实现轻量模型选择逻辑：`openai` → `gpt-4o-mini`，`anthropic` → `claude-haiku-4-20250414`，其他 → 回退到传入的 modelId
- [x] 2.3 编写 `title-generator.ts` 的单元测试：mock `generateText`，验证 prompt 拼接、模型选择、错误处理

## 3. 集成到 Chat API

- [x] 3.1 在 `src/app/api/chat/route.ts` 的 `onFinish` 回调中，持久化助手消息之后，检查 `Topic.title` 是否为空。若为空，fire-and-forget 调用 `generateTopicTitle` 并 `PATCH` 更新到数据库
- [x] 3.2 确保标题生成错误被 `logger.warn` 记录且不影响主流程
- [x] 3.3 在 E2E mock 模式（`MKCHAT_E2E_MOCK_CHAT=1`）下跳过标题生成，避免 mock 环境触发外部 API 调用

## 4. 前端刷新

- [x] 4.1 确认 `ChatContainer` 的 `onFinish` 已触发 `queryClient.invalidateQueries({ queryKey: ["topic", topicId] })`，验证 TopBar 标题会随 refetch 更新（可能需在聊天页面的 TopBar 中读取 topic query 的 title 字段）
- [x] 4.2 在 `ChatEntry.tsx`（会话列表）中确认已正确显示 `topic.title`（当前已实现 `topic.title?.trim() || "未命名对话"`，无需额外修改）

## 5. 验证

- [x] 5.1 运行 `pnpm qa` 确保 typecheck + lint + test 全部通过
- [x] 5.2 手动验证：创建新对话 → 发送消息 → AI 回复后几秒内标题自动出现在 TopBar 和会话列表
