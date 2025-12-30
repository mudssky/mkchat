# mcp-engine Specification

## Purpose
TBD - created by archiving change scaffold-core-app. Update Purpose after archive.
## Requirements
### Requirement: SSE Client Connection

系统 **MUST** 通过 SSE 连接到远程 MCP 服务器以获取工具。

#### Scenario: Initializing chat with an MCP-enabled assistant

- **Given** 一个具有 2 个 MCP 服务器的 Assistant
- **When** 聊天会话开始
- **Then** 系统 **SHALL** 建立到两个 URL 的 SSE 连接并检索工具列表

### Requirement: Tool Execution Proxy

系统 **MUST** 通过 HTTP 将来自 LLM 的工具调用代理到 MCP 服务器。

#### Scenario: LLM requests a tool call

- **Given** LLM 输出一个由 Server A 提供的 "google_search" 工具调用
- **When** 系统执行该工具
- **Then** 它 **SHALL** 向 Server A 的执行端点发送一个 JSON-RPC POST 请求，并将结果返回给 LLM

