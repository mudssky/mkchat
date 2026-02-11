# Change: polish-chat-experience

## Why

聊天核心功能已跑通，但在日常使用中缺少一些"手感"层面的打磨。用户无法看到 Token 消耗、无法便捷复制消息、Markdown 表格渲染不够好看、也不支持图片消息。这些细节直接影响用户对产品质量的感知。

## What Changes

- **Token 用量显示**: 在每条 AI 消息底部显示 prompt/completion token 数量和估算费用，数据来自 `streamText` 的 `onFinish` 回调中的 `usage` 字段，持久化到 Message.metadata
- **消息操作栏**: hover 消息时显示操作栏（复制全文 / 复制代码块 / 重新生成），操作成功后显示短暂 toast 反馈
- **Markdown 增强**: 改善表格渲染样式（响应式横滑），支持 LaTeX 数学公式渲染（KaTeX），改善代码块的语言标签显示
- **图片消息支持**: 支持用户粘贴/拖拽上传图片作为消息内容，以 base64 或本地存储方式保存，在 MessageBubble 中渲染图片预览
- **消息时间戳**: 显示每条消息的发送时间，格式为相对时间（"刚刚" / "3 分钟前" / "昨天 14:30"）

## Impact

**受影响的 specs**:
- **chat-core** (修改): Message.metadata 扩展 token usage 字段
- **chat-ui-components** (修改): MessageBubble 增加操作栏和时间戳

**受影响的代码**:
- `src/app/api/chat/route.ts` - `onFinish` 中保存 usage 到 metadata
- `src/components/chat/MessageBubble.tsx` - 增加操作栏、时间戳、token 显示
- `src/components/chat/MessageList.tsx` - 图片消息渲染
- `src/components/chat/MessageInput.tsx` - 图片上传入口
- `src/types/chat.ts` - ChatMessageMetadata 类型扩展

**预计工作量**: ~2-3 天（各功能可独立交付）
