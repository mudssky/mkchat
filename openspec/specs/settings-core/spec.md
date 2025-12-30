# settings-core Specification

## Purpose
TBD - created by archiving change design-settings-page. Update Purpose after archive.
## Requirements
### Requirement: Settings Persistence

系统 **MUST** 将用户配置持久化到本地存储。

#### Scenario: User reloads page
- **Given** 用户修改了配置 (如 Theme)
- **When** 用户刷新页面或重新打开应用
- **Then** 应用 **SHALL** 恢复之前的配置状态

### Requirement: Provider Configuration

系统 **MUST** 允许用户配置主流 LLM 提供商 (OpenAI, Anthropic 等) 的认证信息。

#### Scenario: Configure OpenAI Key
- **Given** 用户在 Provider 设置页
- **When** 用户输入 API Key
- **Then** 系统 **SHALL** 安全保存该 Key (在本地)

### Requirement: MCP Server Management

系统 **MUST** 支持动态添加和移除 MCP Server 连接。

#### Scenario: Add New Server
- **Given** MCP 设置面板
- **When** 用户输入新的 MCP Server SSE URL 并确认
- **Then** 系统 **SHALL** 记录该 URL 并尝试建立连接

