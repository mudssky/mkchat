# Change: implement-chat-ui

## Why

当前项目已完成基础架构（foundation-setup）和数据建模（data-modeling），但缺少用户可见的聊天界面。用户无法与 AI 助手交互，也无法验证树状消息模型的核心功能。实现聊天 UI 是交付可用产品的关键里程碑。

## What Changes

- **新增聊天页面**: 创建 `/chat/[topicId]` 路由，包含消息列表、输入框和导航组件
- **消息渲染组件**: 基于 Ant Design X 实现 MessageBubble 和 MessageList，支持用户/AI 消息差异化显示
- **流式响应集成**: 使用 Vercel AI SDK 的 `useChat` hook 处理 SSE 流式传输
- **树状导航**: 实现分支指示器和分支选择器，支持在消息树的不同路径间切换
- **状态管理**: 使用 TanStack Query 管理服务端数据，Zustand 管理客户端 UI 状态
- **API 端点**: 创建 `GET /api/topics/[id]` 和 `POST /api/chat` 处理数据获取和消息发送
- **响应式布局**: 适配桌面（≥768px）和移动端（<768px）屏幕尺寸

## Impact

**受影响的 specs**:
- **chat-ui-components** (新增): 定义消息列表、气泡、输入框和导航组件的 UI 需求
- **chat-streaming** (新增): 定义流式响应处理、错误处理和性能优化需求
- **chat-core** (依赖): 使用现有的消息树遍历逻辑
- **data-modeling** (依赖): 使用 Message 和 Topic 数据模型

**受影响的代码**:
- `src/app/(main)/chat/[topicId]/page.tsx` - 新增聊天页面
- `src/components/chat/*` - 新增所有聊天组件
- `src/app/api/topics/[id]/route.ts` - 新增 Topic API
- `src/app/api/chat/route.ts` - 新增 Chat API
- `src/lib/chat/message-tree.ts` - 新增消息树工具函数
- `src/store/chat-store.ts` - 新增聊天状态管理
- `src/app/page.tsx` - 修改，添加聊天入口链接

**依赖关系**:
- 依赖现有的 Prisma schema（Message, Topic, Assistant）
- 依赖 Ant Design X、Vercel AI SDK、TanStack Query、Zustand
- 为后续 MCP 工具集成提供 UI 基础

**时间估算**: ~6 天（28.5 小时）

**风险**:
- Ant Design X 学习曲线 → 参考官方文档，先实现基础功能
- 树状结构可视化复杂度 → 初版使用简单分支指示器
- 流式响应性能 → 使用 Vercel AI SDK 优化方案和批量渲染
