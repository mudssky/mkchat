# Change: 引入高 ROI 测试基础设施

## Why

当前项目缺乏自动化测试，这导致：
- 重构和新功能开发时缺乏信心保障
- 无法快速验证核心逻辑的正确性
- 难以捕获回归问题

引入高 ROI（投资回报率）的测试策略，专注于测试最有价值的部分（纯逻辑、工具函数、关键组件），避免在低价值测试上浪费时间。

## What Changes

- 引入 Vitest 作为测试框架（快速、与 Vite 生态集成良好）
- 配置 Testing Library 用于 React 组件测试
- 建立分层测试策略：
  - **⭐⭐⭐⭐⭐ 纯逻辑/工具函数**：详细测试（ROI 最高）
  - **⭐⭐⭐⭐ 通用 UI 组件**：快照测试（保证基础积木不崩）
  - **⭐⭐⭐ 业务复杂组件**：冒烟测试（能渲染即可）
  - **⭐⭐⭐⭐⭐ 页面级 E2E**：使用 Playwright（仅关键路径）
- 提供测试模板和 Mock 工具库
- 集成到 CI/CD 流程

## Impact

- **Affected specs**: `foundation-setup`（新增测试配置）
- **Affected code**: 
  - 新增配置文件：`vitest.config.ts`, `vitest.setup.ts`
  - 新增依赖：`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, `jsdom`
  - 新增测试工具目录：`src/test-utils/`
  - 更新 `package.json` scripts

## Dependencies

无外部依赖，可独立实施。

## Risks

- 学习曲线：团队需要熟悉测试最佳实践
- 维护成本：测试代码需要与业务代码同步更新

**Mitigation**:
- 提供详细的测试模板和文档
- 采用渐进式策略，优先测试高价值模块
