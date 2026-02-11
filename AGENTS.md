## 项目概述

**mkchat** 是一个类 Cherry Studio 的 AI 对话工作台 Web 应用。核心特性：树形消息结构（支持分支对话）、多 Provider 管理（OpenAI / Anthropic）、远程 MCP 工具集成。

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **UI**: Ant Design X + Tailwind CSS v4 + Lucide Icons
- **状态管理**: TanStack Query（服务端缓存）+ Zustand（客户端持久化）
- **数据库**: SQLite via Prisma ORM (better-sqlite3 adapter)
- **AI**: Vercel AI SDK (`ai` + `@ai-sdk/react`) + MCP SDK (SSE transport)
- **测试**: Vitest (单元/组件) + Playwright (E2E) + React Testing Library
- **代码质量**: Biome (lint + format) + husky + lint-staged
- **日志**: Pino（生产环境禁止 console.log）

## 常用命令

```bash
pnpm dev                    # 开发服务器 (端口 32303)
pnpm build                  # 生产构建
pnpm qa                     # 一键质检：typecheck + lint + format + test
pnpm test                   # Vitest 监听模式
pnpm test:run               # Vitest 单次运行
pnpm test:e2e               # Playwright E2E (端口 32304, mock chat)
pnpm lint                   # Biome check
pnpm format                 # Biome format --write
pnpm format:check           # Biome check --write
pnpm typecheck              # tsc --noEmit
pnpm typecheck:fast         # tsgo --noEmit (原生 TS)
pnpm prisma:generate        # 生成 Prisma 客户端 (输出到 prisma/generated/)
pnpm prisma:migrate-dev     # 开发环境迁移 (使用 .env.development)
pnpm prisma:studio-dev      # Prisma Studio (端口 5555)
```

## 架构总览

### 数据模型（5 个核心实体）

```
User -> ProviderConfig (1:N)   -- API 密钥管理（"钱包"）
User -> MCPServer (1:N)        -- MCP 远程工具服务器（SSE）
User -> Assistant (1:N)        -- 助手配置（绑定 Provider + MCP + system prompt）
Assistant -> Topic (1:N)       -- 会话（对话上下文容器）
Topic -> Message (1:N, Tree)   -- 消息（树形结构, parentId 自引用）
```

Assistant 与 MCPServer 通过 `AssistantOnMCPServer` 多对多关联。

### Prisma 配置

- Schema 拆分为多文件：`prisma/schema/{main,user,provider,assistant,chat}.prisma`
- SQLite 数据库，生成到 `prisma/generated/`
- 路径别名 `@generated/*` 映射到 `prisma/generated/*`
- 环境变量区分：`.env.development` / `.env.production`

### 消息树（核心数据结构）

消息不是线性列表，而是**树形结构**：每条消息有 `parentId`，支持分支对话。

- `src/lib/chat/message-tree.ts` -- 树操作：`buildMessageChain`（从叶子回溯到根）、`findSiblings`、`getDefaultLeaf`
- `src/services/chat-service.ts` -- `getTrace()` 从叶子节点向上遍历构建上下文窗口
- `src/components/chat/BranchNavigator.tsx` -- 分支切换 UI

### 请求流程 (POST /api/chat)

1. 验证请求 (Zod schema)，提取用户消息
2. 查询 Assistant + ProviderConfig
3. 持久化用户消息到 DB
4. 从 DB 获取消息 trace（叶子到根链路）
5. `getModel()` 根据 provider type 创建 AI SDK model 实例
6. `mcpService.getToolsForAssistant()` 发现所有关联 MCP 服务器的工具
7. `streamText()` 流式生成，`onFinish` 持久化助手回复
8. 返回 UI Message Stream Response

### 目录结构约定

```
src/
  app/                       # Next.js App Router
    (main)/                  # 主布局组 (AppShell 侧边栏)
      chat/[topicId]/        # 对话页面
      settings/              # 设置页面组
      conversations/         # 会话列表
    api/                     # Route Handlers
      chat/route.ts          # 主对话 API (streaming)
      topics/                # Topic CRUD
      assistants/            # Assistant CRUD
  components/
    layout/                  # AppShell, TopBar, PageFrame, ModuleSubNav
    chat/                    # ChatContainer, MessageList, MessageBubble, MessageInput, BranchNavigator
    settings/                # ProviderForm, McpServerForm, SettingsSidebar
    ui/                      # StatusBadge 等通用组件
  lib/
    ai/model-factory.ts      # 根据 ProviderConfig 创建 OpenAI/Anthropic model
    mcp/client.ts            # MCP SSE 客户端封装
    chat/                    # message-tree, topic-schema, assistant-schema, chat-performance
    prisma.ts                # Prisma 单例（better-sqlite3 adapter）
    logger.ts                # Pino logger
    query-client.ts          # TanStack Query 配置
    utils.ts                 # cn() 等工具函数
  services/
    chat-service.ts          # 消息持久化 + trace 构建
    mcp-service.ts           # MCP 工具发现 + 执行
  store/
    chat-store.ts            # Zustand: 分支路径 + 输入草稿
    settings-store.ts        # Zustand: 主题/语言/providers/MCP 配置
  types/
    chat.ts                  # ChatMessage, ChatTopic, AssistantSummary 等
    settings.ts              # ThemeMode, ProviderConfig, McpServerConfig
  test-utils/                # 测试辅助: render wrapper, mocks
```

### UI 布局体系

- **AppShell**: 全局壳层，侧边栏导航 (`/`, `/conversations`, `/settings/*`)
- **TopBar**: 页面顶栏（标题/副标题/状态/操作）
- **PageFrame**: 内容容器，支持宽度预设 (`home`, `list`, `chat`, `settings`)
- **ModuleSubNav**: 模块级二级导航（Settings 子页面）

### 主题系统

- 三档主题: `system` | `light` | `dark`
- 通过 `document.documentElement[data-theme]` 属性切换
- CSS 变量定义在 `src/app/globals.css`
- Zustand 持久化到 localStorage (`mkchat-settings`)

## 编码规范

- **Server Components 优先**: 除非需要交互 (`useState`/`useEffect`)，否则使用 RSC
- **Client Components** 标记 `'use client'`，尽量保持为叶子节点
- **TypeScript 严格模式**: 禁止 `any`，使用 `unknown` 替代；`interface` 用于对象，`type` 用于联合/基元
- **运行时校验**: 使用 Zod（API 请求/响应）
- **样式**: Tailwind utility-first，条件类名用 `clsx` / `tailwind-merge`
- **命名**: 文件 `kebab-case`，组件 `PascalCase`，函数/变量 `camelCase`，常量 `UPPER_SNAKE_CASE`
- **路径别名**: `@/*` -> `src/*`, `@generated/*` -> `prisma/generated/*`

## 测试策略

| 层级 | 对象 | 工具 | 策略 |
|------|------|------|------|
| 纯逻辑/工具函数 | `utils/*.ts`, `lib/**/*.ts` | Vitest | 详细测试，覆盖边界 |
| 通用 UI 组件 | Button, StatusBadge 等 | Vitest + 快照 | `toMatchSnapshot()` |
| 业务复杂组件 | ChatContainer, MessageList | Vitest | 冒烟测试 + 关键交互 |
| 页面级 | `app/**/page.tsx` | Playwright | E2E: 打开 -> 检查关键元素 |

- Vitest 配置: `jsdom` 环境, `vitest.setup.ts` 自动 mock `next/navigation`, `vitest.setup.tsx` mock `next/image` + `next/link`
- 测试文件与源码同目录 (`*.test.ts(x)`)
- E2E 测试在 `tests/` 目录, 使用 `MKCHAT_E2E_MOCK_CHAT=1` 环境变量启用 mock 响应

## 质量门禁

每次修改后必须通过 `pnpm qa` (typecheck + lint/format + test)。提交前 husky + lint-staged 自动检查。

当创建或更新 `openspec/changes/**` 与 `openspec/specs/**` 下的 OpenSpec 工件（`proposal.md`、`design.md`、`tasks.md`、`specs/**/*.md`、`validation.md`）时：

1) OpenSpec 模板中的 Markdown 标题与小节名保持英文原文，不做翻译（如 `Why`、`What Changes`、`Context`、`Goals / Non-Goals`、`Decisions`、`Risks / Trade-offs`、`Migration Plan`、`Open Questions`、`Impact`、`Capabilities`、`New Capabilities`、`Modified Capabilities`）。
2) OpenSpec 结构关键词与固定术语保持原样（`ADDED Requirements`、`MODIFIED Requirements`、`REMOVED Requirements`、`RENAMED Requirements`、`Requirement`、`Scenario`、`WHEN`、`THEN`、`BREAKING`）。
3) 除上述标题、关键词与固定术语外，其余叙述必须使用简体中文。
4) 代码、命令、路径、参数名保持原样。

创建skill时使用中文，除了术语等
