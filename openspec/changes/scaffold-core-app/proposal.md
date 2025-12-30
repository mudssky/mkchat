# Change: Scaffold Core Application Layer

## Why
To provide a local-first, flexible, and powerful AI agent interface that decouples providers, assistants, and tools, allowing users to compose their own AI workflows. This foundation allows satisfying the detailed requirements in the PRD.

## What Changes
- Initialize Next.js project with Ant Design X, Tailwind CSS, TanStack Query, and Zustand.
- Implement strictly decoupled Prisma schema (ProviderConfig, MCPServer, Assistant, Topic/Message).
- Create core MCP Client engine for SSE connections.
- Implement Tree-based Chat history data structure.

## Impact
- Affected specs: `foundation-setup`, `data-modeling`, `mcp-engine`, `chat-core`
- Affected code:
  - `src/` (New directory structure)
  - `prisma/schema.prisma` (New file)
  - `package.json` (New dependencies)
