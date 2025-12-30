## 1. Implementation

- [x] 1.1 foundation: 初始化项目
  - [x] 1.1.1 为核心依赖项运行 `npm install` (`prisma`, `@modelcontextprotocol/sdk` 等)。
  - [x] 1.1.2 创建目录结构 `src/app`, `src/lib`, `src/services`, `src/components`。
  - [x] 1.1.3 配置 `pino` 日志记录器。
- [x] 1.2 data: 实现数据库 Schema
  - [x] 1.2.1 使用 `User`, `ProviderConfig`, `MCPServer`, `Assistant`, `Topic`, `Message` 模型创建 `prisma/schema.prisma`。
  - [x] 1.2.2 运行 `prisma generate` 和 `prisma migrate dev`。
  - [x] 1.2.3 验证数据库连接。
- [x] 1.3 mcp: 构建 MCP Client
  - [x] 1.3.1 实现用于 SSE 连接处理的 `lib/mcp/client.ts`。
  - [x] 1.3.2 创建 `mcp-service` 来管理活动连接。
  - [x] 1.3.3 添加工具发现逻辑。
- [x] 1.4 chat: 实现聊天逻辑
  - [x] 1.4.1 创建 `services/chat-service.ts`。
  - [x] 1.4.2 实现 `getTrace(leafId)` 以构建 context window。
  - [x] 1.4.3 实现 `createMessage(content, parentId)` 逻辑。
- [x] 1.5 api: 基础 API 路由
  - [x] 1.5.1 构建 `app/api/chat/route.ts` (连接到 Vercel AI SDK 的存根实现)。
