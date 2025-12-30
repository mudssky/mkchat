# Spec: Foundation Setup

## ADDED Requirements

### Requirement: Project Structure Initialization
The project SHALL follow the defined directory structure in the PRD.

#### Scenario: Developer inspects src folder
- **When** `ls -R src` is run
- **Then** the folders `app/(main)`, `components/ai-chat`, `lib/mcp` SHALL exist

### Requirement: Tech Stack Dependencies
Core dependencies MUST be installed.

#### Scenario: Checking package.json
- **When** the developer checks dependencies
- **Then** `prisma`, `@modelcontextprotocol/sdk`, `@langchain/core`, `ai`, `pino` SHALL be present
