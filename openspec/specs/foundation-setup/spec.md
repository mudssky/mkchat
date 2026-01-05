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

### Requirement: 测试框架配置

项目 **SHALL** 配置 Vitest 作为测试框架，支持单元测试和组件测试。

#### Scenario: 开发者运行测试命令

- **WHEN** 开发者执行 `pnpm test`
- **THEN** Vitest **SHALL** 启动并进入 watch 模式

#### Scenario: 开发者运行所有测试

- **WHEN** 开发者执行 `pnpm test:run`
- **THEN** 所有测试 **SHALL** 执行并显示结果摘要

#### Scenario: 开发者查看测试 UI

- **WHEN** 开发者执行 `pnpm test:ui`
- **THEN** Vitest UI **SHALL** 在浏览器中打开

### Requirement: 测试环境配置

测试环境 **SHALL** 配置为 jsdom，支持 DOM 操作和 React 组件渲染。

#### Scenario: 测试文件访问 DOM API

- **WHEN** 测试代码使用 `document` 或 `window` 对象
- **THEN** jsdom **SHALL** 提供模拟的 DOM 环境，不抛出 "window is not defined" 错误

#### Scenario: 测试文件使用路径别名

- **WHEN** 测试代码导入 `@/components/Button`
- **THEN** 路径别名 **SHALL** 正确解析到 `src/components/Button`

### Requirement: Next.js Mock 支持

测试环境 **SHALL** 提供 Next.js 特有功能的 Mock，确保组件测试正常运行。

#### Scenario: 组件使用 useRouter

- **WHEN** 被测组件调用 `useRouter()` hook
- **THEN** Mock **SHALL** 返回包含 `push`, `replace`, `back` 方法的对象

#### Scenario: 组件使用 next/image

- **WHEN** 被测组件渲染 `<Image>` 组件
- **THEN** Mock **SHALL** 将其替换为标准 `<img>` 元素，避免懒加载错误

### Requirement: 测试工具库

项目 **SHALL** 提供可复用的测试工具和 Mock 函数，简化测试编写。

#### Scenario: 开发者需要自定义 render 函数

- **WHEN** 开发者从 `@/test-utils` 导入 `render`
- **THEN** **SHALL** 获得包装了必要 Provider 的自定义渲染函数

#### Scenario: 开发者需要 Mock next/navigation

- **WHEN** 开发者从 `@/test-utils/mocks` 导入 Mock
- **THEN** **SHALL** 获得预配置的 Next.js navigation Mock

### Requirement: 测试模板和示例

项目 **SHALL** 提供测试模板和示例，指导开发者编写不同类型的测试。

#### Scenario: 开发者查看组件测试示例

- **WHEN** 开发者打开 `src/__tests__/examples/component.test.tsx`
- **THEN** **SHALL** 看到冒烟测试、快照测试、交互测试的示例代码

#### Scenario: 开发者查看工具函数测试示例

- **WHEN** 开发者打开 `src/__tests__/examples/utils.test.ts`
- **THEN** **SHALL** 看到纯函数单元测试的示例代码

### Requirement: 测试依赖项

测试相关依赖项 **MUST** 被安装为开发依赖。

#### Scenario: 检查测试依赖

- **WHEN** 开发者检查 `package.json` 的 `devDependencies`
- **THEN** `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` **SHALL** 存在

