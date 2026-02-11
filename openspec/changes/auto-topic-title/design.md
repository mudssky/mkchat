# Design: auto-topic-title

## Context

当前 `Topic` 模型有 `title` 字段（`String?`），创建时默认为 `null`。会话列表（`ChatEntry.tsx`）中对空标题显示 "未命名对话"。

聊天 API（`POST /api/chat`）中 `streamText` 的 `onFinish` 回调已有持久化助手消息的逻辑，是触发标题生成的自然切入点。

`model-factory.ts` 可根据 `ProviderConfig` 创建 AI SDK model 实例，标题生成可复用此能力。

Topic API（`GET /api/topics/[id]`）目前只有 GET handler，需新增 PATCH 用于更新标题。

## Goals / Non-Goals

**Goals:**
- 在首次 AI 回复完成后自动生成简洁的中文对话标题（≤20 字）
- 标题生成不阻塞主聊天流，异步执行（fire-and-forget）
- 标题生成后前端自动刷新展示
- 支持用户后续手动修改标题（不被自动标题覆盖）

**Non-Goals:**
- 不做多语言标题检测（始终生成中文标题，后续 i18n 可扩展）
- 不做标题风格自定义（固定 prompt 模板）
- 不做标题重新生成按钮（手动编辑可覆盖，后续可加）
- 不处理对话中途的标题更新（仅首次生成）

## Decisions

### Decision 1: 在 `onFinish` 中异步触发标题生成

**选择**: 在 `chat/route.ts` 的 `onFinish` 回调中检测 `Topic.title` 是否为空，若为空则 fire-and-forget 调用标题生成函数。

**备选方案**:
- **(A) 前端触发**: `ChatContainer` 的 `onFinish` 中调用独立 API → 增加前端复杂度，且需处理竞态
- **(B) 数据库触发器**: Prisma middleware → 过于耦合，不灵活
- **(C) 后端 onFinish fire-and-forget** ✅ → 最简单，不阻塞流式响应返回

**理由**: 后端已有 `onFinish` 逻辑，追加一步异步调用最自然，不影响响应延迟。错误静默处理（log warning）不影响核心聊天体验。

### Decision 2: 复用 Assistant 绑定的 Provider + 使用轻量模型

**选择**: 使用 Assistant 关联的同一 `ProviderConfig`，但硬编码一个轻量 modelId（如 OpenAI 下用 `gpt-4o-mini`，Anthropic 下用 `claude-haiku-4-20250414`）。

**备选方案**:
- **(A) 使用 Assistant 的同一 model** → 浪费 token，如 GPT-4o 生成 10 字标题成本不合理
- **(B) 用户可配置标题生成模型** → 过度设计，初版不需要
- **(C) 硬编码轻量模型** ✅ → 成本低，实现简单

**理由**: 标题生成是简单任务，轻量模型足够。通过 provider type 映射到对应的轻量模型，避免额外配置。

### Decision 3: 前端通过 Query Invalidation 自动刷新

**选择**: 标题生成成功后，前端通过已有的 `queryClient.invalidateQueries({ queryKey: ["topic", topicId] })` 机制在下一次 refetch 时获取新标题。不需要额外的 WebSocket 或 SSE 通知。

**备选方案**:
- **(A) 返回标题在流式响应中** → 需修改流协议，侵入性大
- **(B) 前端轮询标题** → 不优雅
- **(C) 依赖已有 invalidation** ✅ → `onFinish` 已触发 invalidation，标题异步更新后下一次 refetch 自然拿到

**理由**: `ChatContainer` 的 `onFinish` 回调已经调用 `queryClient.invalidateQueries`。由于标题生成是异步的，可能第一次 refetch 时标题尚未写入，但这是可接受的——用户几秒后刷新或发送下一条消息时标题就会出现。如果需要更即时，可在标题生成完成后通过返回自定义 header 或 data annotation 通知前端。初版选择最简方案。

### Decision 4: PATCH API 独立于 auto-title

**选择**: 新增 `PATCH /api/topics/[id]` 通用端点，支持 `{ title: string }` body。标题生成服务和未来的手动重命名都复用此端点。

**理由**: 遵循 RESTful 规范，功能正交，与 `enhance-topic-management` 提案无冲突。

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 标题生成失败（Provider 余额不足、网络超时）→ 标题保持为空 | 静默 log warning，不影响用户体验。用户看到"未命名对话"与现状一致 |
| 轻量模型 modelId 在某些自定义 Provider 不存在 | 加 fallback：若轻量模型不可用，使用 Assistant 原始 modelId |
| 标题生成与 `onFinish` 消息持久化竞态 | 标题生成在消息持久化之后执行，使用 `await createMessage` 后的 `.then()` 链 |
| 标题生成增加 API 延迟 | fire-and-forget 模式，不 await，不阻塞 response 返回 |
