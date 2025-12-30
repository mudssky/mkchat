# Spec: Data Modeling

## ADDED Requirements

### Requirement: Provider Entity
The system MUST store API keys and base URLs for providers.

#### Scenario: Creating a provider config
- **Given** a user wants to add DeepSeek
- **When** saving the config
- **Then** a `ProviderConfig` record SHALL be created with `type`, `apiKey`, and optional `baseUrl`

### Requirement: MCP Server Entity
The system MUST store remote SSE endpoints.

#### Scenario: Adding a wrapper service
- **Given** a URL `https://mcp.tool/sse`
- **When** saving the MCP server
- **Then** an `MCPServer` record SHALL be created

### Requirement: Assistant Composition
The system MUST link Providers and MCPs to an Assistant.

#### Scenario: Configuring an assistant
- **Given** a Provider ID and multiple MCP Server IDs
- **When** creating an Assistant
- **Then** the Assistant record SHALL be linked to the Provider and have a many-to-many relation with MCP Servers

### Requirement: Tree-based Message Model
Messages MUST support recursive parent relationships.

#### Scenario: Storing a reply
- **Given** a parent message ID
- **When** a new message is saved
- **Then** the `parentId` field SHALL reference the previous message
