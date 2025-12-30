# data-modeling Specification

## Purpose
TBD - created by archiving change scaffold-core-app. Update Purpose after archive.
## Requirements
### Requirement: Provider Entity

系统 **MUST** 存储 providers 的 API keys 和 base URLs。

#### Scenario: Creating a provider config

- **Given** 用户想要添加 DeepSeek
- **When** 保存 config
- **Then** 一个 `ProviderConfig` 记录 **SHALL** 被创建，且包含 `type`, `apiKey` 和可选的 `baseUrl`

### Requirement: MCP Server Entity

系统 **MUST** 存储远程 SSE 端点。

#### Scenario: Adding a wrapper service

- **Given** 一个 URL `https://mcp.tool/sse`
- **When** 保存 MCP server
- **Then** 一个 `MCPServer` 记录 **SHALL** 被创建

### Requirement: Assistant Composition

系统 **MUST** 将 Providers 和 MCPs 链接到一个 Assistant。

#### Scenario: Configuring an assistant

- **Given** 一个 Provider ID 和多个 MCP Server IDs
- **When** 创建一个 Assistant
- **Then** Assistant 记录 **SHALL** 链接到 Provider, 并且与 MCP Servers 具有多对多关系

### Requirement: Tree-based Message Model

Messages **MUST** 支持递归父子关系。

#### Scenario: Storing a reply

- **Given** 一个父消息 ID
- **When** 一条新消息被保存
- **Then** `parentId` 字段 **SHALL** 引用前一条消息

