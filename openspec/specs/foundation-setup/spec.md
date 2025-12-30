# foundation-setup Specification

## Purpose
TBD - created by archiving change scaffold-core-app. Update Purpose after archive.
## Requirements
### Requirement: Project Structure Initialization

项目 **SHALL** 遵循 PRD 中定义的目录结构。

#### Scenario: Developer inspects src folder

- **When** 运行 `ls -R src`
- **Then** 文件夹 `app/(main)`, `components/ai-chat`, `lib/mcp` **SHALL** 存在

### Requirement: Tech Stack Dependencies

核心依赖项 **MUST** 被安装。

#### Scenario: Checking package.json

- **When** 开发者检查依赖项
- **Then** `prisma`, `@modelcontextprotocol/sdk`, `@langchain/core`, `ai`, `pino` **SHALL** 存在

