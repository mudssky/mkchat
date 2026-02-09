# 聊天组件使用说明

本文档描述聊天 UI 相关组件的职责和使用方式。

## 组件概览

- `ChatContainer`
  - 负责数据获取、流式状态管理、错误处理、重试与停止生成。
  - 对接 `useChat` 与 Topic API，维护当前分支路径。
- `MessageList`
  - 渲染当前分支消息链，支持分支切换、消息复制、消息编辑入口。
  - 针对长对话启用虚拟滚动并执行自动滚动。
- `MessageBubble`
  - 渲染单条消息样式（用户/助手区分）、Markdown 与代码块。
  - 支持流式光标与状态标记（发送中/未完成/正在输入）。
- `MessageInput`
  - 处理输入验证与发送。
  - 支持 `Ctrl/Cmd + Enter` 快捷发送。
- `BranchNavigator`
  - 展示并切换兄弟分支。

## 最小接入示例

```tsx
import { ChatContainer } from "@/components/chat/ChatContainer";

export default function ChatSection() {
  return <ChatContainer topicId="c0123456789abcdef0123456" assistantName="Demo" />;
}
```

## 性能监控（开发环境）

- `ChatContainer` 在开发环境展示最近 5 条性能指标。
- 指标来源：
  - `message-chain-build`
  - `ui-message-normalize`
  - `message-list-auto-scroll`
- 如需在外部监听，可订阅浏览器事件：`mkchat:chat-performance`。

## 无障碍与交互规范

- 关键操作按钮提供 `aria-label`。
- 焦点态统一使用 `focus-visible` ring。
- 触摸交互按钮使用 `touch-manipulation` 和最小点击尺寸。

## Storybook 示例（可选）

- 已新增示例文件：`src/components/chat/MessageInput.stories.tsx`
- 包含场景：
  - `Default`（默认输入状态）
  - `WithDraft`（带草稿内容）
  - `Disabled`（禁用/发送中态）
- 该文件采用 CSF 风格，可在后续引入 Storybook 工具链后直接使用。
