
# Project: AI Agent Workbench (Web Edition)
>
> A Cherry Studio-like web application with Tree-based chat, decoupled Provider management, and Remote MCP tool integration.

## 1. 核心架构理念

* **Decoupled (解耦)**: 凭证 (API Keys)、人设 (Assistants)、工具 (MCP) 完全分离，任意组合。
* **Tree-Structured (树状)**: 聊天记录支持分叉 (Branching) 和回溯。
* **Web-Native (Web 原生)**: 优先支持 SSE (Server-Sent Events) 协议连接远程 MCP，适应 Serverless/Container 环境。

## 2. 黄金技术栈 (Golden Stack)

| 领域 | 选型 | 作用 |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | 全栈框架，利用 Server Actions 处理逻辑 |
| **Language** | **TypeScript** | 强类型约束 |
| **UI Library** | **Ant Design X** | 专用的 AI 聊天 UI (Bubble, Prompts, Attachments) |
| **Styling** | **Tailwind CSS** with **cva** | 布局与响应式设计 |
| **State (Server)**| **TanStack Query** | 服务端数据缓存与同步 (Chat Tree, Assistant List) |
| **State (Client)**| **Zustand** | 前端交互状态 (Sidebar, Modals) |
| **Database** | **sqlite** | 关系型数据存储 |
| **ORM** | **Prisma** | 类型安全的数据库操作 |
| **AI SDK** | **Vercel AI SDK (Core + UI)** | 处理流式传输 (Streaming) |
| **AI Logic** | **LangChain.js** | 编排 LLM 调用链 |
| **Extensions** | **@modelcontextprotocol/sdk** | 连接远程 MCP Server (SSE Client) |
| **Logging** | **Pino**,**Pino-pretty** | 高性能结构化日志，支持异步落盘与日志采样 |
| **I18n** | **next-intl** | 国际化支持，支持服务端 & 客户端翻译 |

## 3. 数据库模型 (Prisma Schema Design)

核心设计点：**Provider 独立化**，**MCP 远程化**，**Message 树状化**。

```prisma
// schema.prisma (简化版概念验证)

model User {
  id              String           @id @default(cuid())
  providerConfigs ProviderConfig[]
  mcpServers      MCPServer[]
  assistants      Assistant[]
}

// 1. 供应商配置 (The Wallet)
// 存储 OpenAI/Anthropic 的 API Key，不绑定具体助手
model ProviderConfig {
  id          String   @id @default(cuid())
  userId      String   @relation(...)

  name        String   // e.g. "My DeepSeek Key"
  type        String   // "openai", "anthropic", "google"
  apiKey      String   // Encrypted
  baseUrl     String?  // Optional for proxy

  assistants  Assistant[]
}

// 2. MCP 服务器 (The Hands - SSE Only)
// 存储远程工具服务的连接地址
model MCPServer {
  id          String   @id @default(cuid())
  userId      String   @relation(...)

  name        String   // e.g. "Brave Search Service"
  url         String   // SSE Endpoint e.g. "https://mcp.myservice.com/sse"
  enabled     Boolean  @default(true)

  assistants  AssistantOnMCPServer[]
}

// 3. 助手 (The Brain)
// 将 "谁买单(Provider)" 和 "用什么工具(MCP)" 结合
model Assistant {
  id               String   @id @default(cuid())
  userId           String   @relation(...)

  name             String
  providerConfigId String?
  providerConfig   ProviderConfig? @relation(...)

  modelId          String   // e.g. "gpt-4o"
  systemPrompt     String   @db.Text

  // 多对多关联：一个助手可以用多个 MCP
  mcpServers       AssistantOnMCPServer[] 

  topics           Topic[]
}

model AssistantOnMCPServer {
  assistantId String
  serverId    String
  // Relation definitions...
}

// 4. 会话与消息 (The Memory)
model Topic {
  id          String    @id @default(cuid())
  assistantId String
  messages    Message[]
}

model Message {
  id          String   @id @default(cuid())
  topicId     String
  content     String   @db.Text
  role        String   // user/assistant/system/tool

  // 树状结构核心
  parentId    String?
  children    Message[] @relation("Tree")
  parent      Message?  @relation("Tree", fields: [parentId], references: [id])
}
```

## 4. MCP 运行时逻辑 (SSE Client Flow)

这是一个 **Client-to-Server** 的架构。Next.js 后端作为 MCP Client，连接第三方的 MCP Server。

1. **配置阶段**：用户在设置页输入 `SSE URL` (例如一个部署在 Render/Railway 上的 Python 服务)。
2. **启动会话**：
    * 用户发送消息给“助手 A”。
    * Next.js 读取“助手 A”关联的 MCP Server URLs。
    * Next.js 通过 `SSE` 连接这些 URL，获取 `Tools` 列表 (JSON Schema)。
3. **推理与执行**：
    * LangChain 将 Tools 注入 LLM。
    * LLM 决定调用 `google_search`。
    * Next.js 通过 HTTP POST (JSON-RPC) 发送调用请求给 MCP Server。
    * MCP Server 执行并返回结果。
    * Next.js 将结果回传给 LLM 进行总结。

## 5. 项目目录结构规范

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
