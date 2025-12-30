## 1. Implementation

- [ ] 1.1 foundation: 初始化项目
  - [ ] 1.1.1 为核心依赖项运行 `npm install` (`prisma`, `@modelcontextprotocol/sdk` 等)。
  - [ ] 1.1.2 创建目录结构 `src/app`, `src/lib`, `src/services`, `src/components`。
  - [ ] 1.1.3 配置 `pino` 日志记录器。
- [ ] 1.2 data: 实现数据库 Schema
  - [ ] 1.2.1 使用 `User`, `ProviderConfig`, `MCPServer`, `Assistant`, `Topic`, `Message` 模型创建 `prisma/schema.prisma`。
  - [ ] 1.2.2 运行 `prisma generate` 和 `prisma migrate dev`。
  - [ ] 1.2.3 验证数据库连接。
- [ ] 1.3 mcp: 构建 MCP Client
  - [ ] 1.3.1 实现用于 SSE 连接处理的 `lib/mcp/client.ts`。
  - [ ] 1.3.2 创建 `mcp-service` 来管理活动连接。
  - [ ] 1.3.3 添加工具发现逻辑。
- [ ] 1.4 chat: 实现聊天逻辑
  - [ ] 1.4.1 创建 `services/chat-service.ts`。
  - [ ] 1.4.2 实现 `getTrace(leafId)` 以构建 context window。
  - [ ] 1.4.3 实现 `createMessage(content, parentId)` 逻辑。
- [ ] 1.5 api: 基础 API 路由
  - [ ] 1.5.1 构建 `app/api/chat/route.ts` (连接到 Vercel AI SDK 的存根实现)。
