# 📂 30_project_specific.md

## 🌟 Project Context
**Name**: AI Agent Workbench (Web Edition)
**Goal**: A Cherry Studio-like web application with Tree-based chat, decoupled Provider management, and Remote MCP tool integration.

## 🛠️ Core Stack
- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5+
- **UI Library**: Ant Design X (AI Chat UI), React 19.2.3
- **Styling**: Tailwind CSS v4
- **State Management**:
  - Server: TanStack Query
  - Client: Zustand
- **Database**: SQLite (via Prisma ORM)
- **AI Stack**:
  - Vercel AI SDK (Core + UI)
  - LangChain.js
  - MCP SDK (@modelcontextprotocol/sdk)
- **I18n**: next-intl
- **Linting/Formatting**: Biome

## 📜 Scripts
| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Biome check |
| `pnpm format` | Run Biome format |
| `pnpm typecheck` | Run TypeScript check |
| `pnpm qa` | Run typecheck, lint, and format check |
| `pnpm prisma:generate` | Generate Prisma client |
| `pnpm prisma:migrate-dev` | Run Prisma migrations (dev) |

## 📂 Directory Structure (ASCII)
```text
src/
├── app/
│   ├── (main)/
│   │   ├── settings/
│   │   │   ├── providers/page.tsx   # API Key 管理
│   │   │   └── mcp/page.tsx         # 远程 MCP URL 管理
│   │   ├── assistants/[id]/page.tsx # 助手配置 (绑定 Provider & MCP)
│   │   └── chat/[topicId]/page.tsx  # 核心对话界面
│   └── api/
│       ├── chat/route.ts            # 主对话入口 (Stream response)
│       └── mcp/proxy/route.ts       # (可选) 用于前端测试连接
├── components/
│   ├── ai-chat/                     # Ant Design X 组件
│   │   ├── bubble.tsx
│   │   └── sender.tsx
│   └── settings/
│       └── mcp-server-form.tsx
├── lib/
│   ├── mcp/
│   │   └── client.ts                # MCP SSE Client 封装
│   ├── ai/
│   │   └── model-factory.ts         # 根据 ProviderConfig 创建 Model 实例
│   └── prisma.ts
└── services/
    └── chat-service.ts              # 负责从 Tree 构建 Context Window
```

## 📏 Strictness Level
**Level**: **High**
- Every PR/Change must pass `pnpm qa`.
- No `any` allowed.
- No console logs in production code (use Pino).
