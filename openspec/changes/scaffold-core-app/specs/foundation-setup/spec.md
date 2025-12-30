# Spec: Foundation Setup

## ADDED Requirements

### Requirement: Project Structure Initialization
项目应遵循 PRD 中定义的目录结构。

#### Scenario: Developer inspects src folder
- **When** 运行 `ls -R src` 时
- **Then** `app/(main)`, `components/ai-chat`, `lib/mcp` 等文件夹应存在

### Requirement: Tech Stack Dependencies
必须安装核心依赖项。

#### Scenario: Checking package.json
- **When** 开发者检查依赖项时
- **Then** `prisma`, `@modelcontextprotocol/sdk`, `@langchain/core`, `ai`, `pino` 应已安装
