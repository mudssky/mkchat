# Spec: MCP Engine

## ADDED Requirements

### Requirement: SSE Client Connection
The system MUST connect to remote MCP servers via SSE to fetch tools.

#### Scenario: Initializing chat with an MCP-enabled assistant
- **Given** an Assistant with 2 MCP servers
- **When** the chat session starts
- **Then** the system SHALL establish SSE connections to both URLs and retrieve the list of tools

### Requirement: Tool Execution Proxy
The system MUST proxy tool calls from LLM to the MCP server via HTTP.

#### Scenario: LLM requests a tool call
- **Given** the LLM outputs a tool call for `google_search` provided by Server A
- **When** the system executes the tool
- **Then** it SHALL send a JSON-RPC POST request to Server A's execution endpoint and return the result to the LLM
