## 1. Implementation

- [ ] 1.1 foundation: Initialize Project
  - [ ] 1.1.1 Run `npm install` for core dependencies (`prisma`, `@modelcontextprotocol/sdk`, etc).
  - [ ] 1.1.2 Create directory structure `src/app`, `src/lib`, `src/services`, `src/components`.
  - [ ] 1.1.3 Configure `pino` logger.
- [ ] 1.2 data: Implement Database Schema
  - [ ] 1.2.1 Create `prisma/schema.prisma` with `User`, `ProviderConfig`, `MCPServer`, `Assistant`, `Topic`, `Message` models.
  - [ ] 1.2.2 Run `prisma generate` and `prisma migrate dev`.
  - [ ] 1.2.3 Verify database connection.
- [ ] 1.3 mcp: Build MCP Client
  - [ ] 1.3.1 Implement `lib/mcp/client.ts` for SSE connection handling.
  - [ ] 1.3.2 Create `mcp-service` to manage active connections.
  - [ ] 1.3.3 Add tool discovery logic.
- [ ] 1.4 chat: Implement Chat Logic
  - [ ] 1.4.1 Create `services/chat-service.ts`.
  - [ ] 1.4.2 Implement `getTrace(leafId)` to build context window.
  - [ ] 1.4.3 Implement `createMessage(content, parentId)` logic.
- [ ] 1.5 api: Basic API Routes
  - [ ] 1.5.1 Scaffold `app/api/chat/route.ts` (stub implementation connecting to Vercel AI SDK).
