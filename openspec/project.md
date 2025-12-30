# Project Context

## Purpose
**AI Agent Workbench (Web Edition)**
A Cherry Studio-like web application with Tree-based chat, decoupled Provider management, and Remote MCP tool integration.

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
- Use `pnpm qa` for linting and formatting.
- **Strictness**: High (No `any`, no console logs in prod).
- Follow SOLID principles.
- Use Server Components by default.
- Functional components only.

### Architecture Patterns
- **Decoupled**: Provider, Assistants, and MCP Tools are separate entities.
- **Tree-Structured Chat**: Messages support branching and history navigation.
- **Web-Native**: SSE for remote MCP connections.

### Directory Structure
See `prd/init.md` or `src/` for the defined structure.

## Important Constraints
- **Database**: SQLite (local/embedded focus).
- **Environment**: Desktop/Web usage.

## External Dependencies
- OpenAI / Anthropic / Google APIs (User provided keys)
- Remote MCP Servers (User provided URLs)
