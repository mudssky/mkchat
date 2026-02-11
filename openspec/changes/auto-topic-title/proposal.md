# Change: auto-topic-title

## Why

当前创建的对话标题始终为空（显示"未命名对话"），用户需要依赖记忆或点进去才能识别对话内容。当历史会话超过 5-6 条后，列表变得难以辨识。

自动标题是所有 AI 聊天应用（ChatGPT, Claude, Cherry Studio）的标配功能，实现成本低但体验提升显著。

## What Changes

- **自动生成标题**: 在用户发送第一条消息并收到 AI 首次回复后（`onFinish` 回调中），调用 LLM 根据对话内容生成一个简短标题（10-20 字）
- **标题生成 Prompt**: 使用轻量模型（如 gpt-4o-mini）以节省成本，Prompt 模板: "根据以下对话生成一个简洁的中文标题（不超过 20 字）: {messages}"
- **标题更新 API**: `PATCH /api/topics/[id]` 更新 Topic.title 字段
- **前端刷新**: 标题生成后自动刷新侧栏和页面 TopBar 中的标题显示
- **手动修改**: 用户可点击标题手动编辑覆盖（与 enhance-topic-management 的重命名功能复用）
- **仅首次生成**: 仅在 Topic.title 为空时自动生成，避免覆盖用户手动设置的标题

## Impact

**受影响的 specs**:
- **chat-core** (修改): 新增对话标题自动生成逻辑

**受影响的代码**:
- `src/app/api/chat/route.ts` - `onFinish` 中检测并触发标题生成
- `src/app/api/topics/[id]/route.ts` - 增加 PATCH handler
- `src/lib/ai/title-generator.ts` - 新增，封装标题生成逻辑
- `src/components/chat/ChatContainer.tsx` - 标题生成后刷新查询

**依赖关系**:
- 需要 Provider 配置中有可用的 LLM（复用 Assistant 绑定的 Provider）
- 与 `enhance-topic-management` 的重命名功能有交集，但可独立交付

**预计工作量**: ~0.5-1 天
