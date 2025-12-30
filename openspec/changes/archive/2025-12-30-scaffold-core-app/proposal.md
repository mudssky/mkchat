# Change: Scaffold Core Application Layer

## Why

为了提供一个本地优先、灵活且强大的 AI agent 界面，将 providers, assistants 和 tools 解耦，允许用户构建自己的 AI 工作流。该基础能够满足 PRD 中的详细需求。

## What Changes

- 使用 Ant Design X, Tailwind CSS, TanStack Query 和 Zustand 初始化 Next.js 项目。
- 实现严格解耦的 Prisma schema (ProviderConfig, MCPServer, Assistant, Topic/Message)。
- 创建用于 SSE 连接的核心 MCP Client 引擎。
- 实现基于 Tree 的聊天历史数据结构。

## Impact

- 受影响的 specs: `foundation-setup`, `data-modeling`, `mcp-engine`, `chat-core`
- 受影响的代码:
  - `src/` (新目录结构)
  - `prisma/schema.prisma` (新文件)
  - `package.json` (新依赖)
