# Project Context

## Purpose

**AI Agent Workbench (Web Edition)**
一个类似于 Cherry Studio 的 Web 应用程序，具有基于 Tree 的聊天、解耦的 Provider 管理和远程 MCP 工具集成。

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI & Styling**: Ant Design X, Tailwind CSS, cva
- **State**: TanStack Query (Server), Zustand (Client)
- **Database**: SQLite with Prisma ORM
- **AI**: Vercel AI SDK (Core + UI), LangChain.js
- **Extensions**: @modelcontextprotocol/sdk (SSE Client)

## Project Conventions

### Code Style

- 使用 `pnpm qa` 进行 linting 和格式化。
- **Strictness**: High (不允许使用 `any`，生产环境中不允许 console logs)。
- 遵循 SOLID 原则。
- 默认使用 Server Components。
- 仅使用 Functional components。

### Architecture Patterns

- **Decoupled**: Provider, Assistants, 和 MCP Tools 是独立的实体。
- **Tree-Structured Chat**: 消息支持分支和历史导航。
- **Web-Native**: 使用 SSE 进行远程 MCP 连接。

### Directory Structure

参见 `prd/init.md` 或 `src/` 了解定义的结构。

## Important Constraints

- **Database**: SQLite (专注于本地/嵌入式)。
- **Environment**: Desktop/Web 使用。

## External Dependencies

- OpenAI / Anthropic / Google APIs (用户提供 keys)
- Remote MCP Servers (用户提供 URLs)
