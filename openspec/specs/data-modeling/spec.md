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

#### Scenario: Cascade delete with topic

- **WHEN** 一个 Topic 被删除
- **THEN** 关联的所有 Message 记录 **SHALL** 被级联删除（`onDelete: Cascade`）

### Requirement: Topic Pinned State

Topic **MUST** 支持置顶标记。

#### Scenario: Topic has pinned field

- **WHEN** 创建新 Topic
- **THEN** `pinned` 字段 **SHALL** 默认为 `false`

#### Scenario: Pin a topic

- **WHEN** 用户将 Topic 置顶
- **THEN** `pinned` 字段 **SHALL** 更新为 `true`

### Requirement: Topic Archive State

Topic **MUST** 支持归档状态。

#### Scenario: Topic has archivedAt field

- **WHEN** 创建新 Topic
- **THEN** `archivedAt` 字段 **SHALL** 默认为 `null`，表示活跃状态

#### Scenario: Archive a topic

- **WHEN** 用户归档 Topic
- **THEN** `archivedAt` 字段 **SHALL** 设置为当前时间戳

#### Scenario: Unarchive a topic

- **WHEN** 用户恢复已归档的 Topic
- **THEN** `archivedAt` 字段 **SHALL** 重置为 `null`

