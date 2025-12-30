# Spec: Data Modeling

## ADDED Requirements

### Requirement: Provider Entity

系统必须存储提供商的 API keys 和 base URLs。

#### Scenario: Creating a provider config

- **Given** 用户想要添加 DeepSeek
- **When** 保存配置时
- **Then** 应创建一个 `ProviderConfig` 记录，包含 `type`, `apiKey` 和可选的 `baseUrl`

### Requirement: MCP Server Entity

系统必须存储远程 SSE endpoints。

#### Scenario: Adding a wrapper service

- **Given** 一个 URL `https://mcp.tool/sse`
- **When** 保存 MCP server 时
- **Then** 应创建一个 `MCPServer` 记录

### Requirement: Assistant Composition

系统必须将 Providers 和 MCPs 链接到一个 Assistant。

#### Scenario: Configuring an assistant

- **Given** 一个 Provider ID 和多个 MCP Server IDs
- **When** 创建一个 Assistant 时
- **Then** Assistant 记录应链接到 Provider，并与 MCP Servers 建立多对多关系

### Requirement: Tree-based Message Model

消息必须支持递归父子关系。

#### Scenario: Storing a reply

- **Given** 一个父消息 ID
- **When** 保存新消息时
- **Then** `parentId` 字段应引用上一条消息
