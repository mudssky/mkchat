# Implementation Tasks

## 1. 安装依赖和配置

- [ ] 1.1 安装 Vitest 核心依赖
  ```bash
  pnpm add -D vitest @vitest/ui
  ```

- [ ] 1.2 安装 React 测试库
  ```bash
  pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
  ```

- [ ] 1.3 安装 Vite React 插件
  ```bash
  pnpm add -D @vitejs/plugin-react vite-tsconfig-paths
  ```

## 2. 创建配置文件

- [ ] 2.1 创建 `vitest.config.ts` 配置文件
  - 配置 jsdom 环境
  - 配置路径别名支持
  - 配置全局变量
  - 配置 setupFiles

- [ ] 2.2 创建 `vitest.setup.ts` 设置文件
  - 导入 @testing-library/jest-dom
  - 配置全局清理钩子
  - 配置 Next.js 相关 Mock

## 3. 创建测试工具库

- [ ] 3.1 创建 `src/test-utils/mocks/next-navigation.ts`
  - Mock useRouter
  - Mock useSearchParams
  - Mock usePathname

- [ ] 3.2 创建 `src/test-utils/mocks/next-image.ts`
  - Mock Next.js Image 组件

- [ ] 3.3 创建 `src/test-utils/render.tsx`
  - 创建自定义 render 函数
  - 包装必要的 Provider

- [ ] 3.4 创建 `src/test-utils/index.ts`
  - 导出所有测试工具

## 4. 创建测试模板和示例

- [ ] 4.1 创建 `src/__tests__/examples/component.test.tsx`
  - 组件测试示例
  - 冒烟测试示例
  - 快照测试示例
  - 交互测试示例

- [ ] 4.2 创建 `src/__tests__/examples/utils.test.ts`
  - 工具函数测试示例

- [ ] 4.3 创建 `src/__tests__/examples/server-action.test.ts`
  - Server Action 测试示例

## 5. 编写实际测试用例

- [ ] 5.1 为 `src/lib/utils.ts` 编写测试（如果存在）
- [ ] 5.2 为核心工具函数编写测试
- [ ] 5.3 为关键 UI 组件编写快照测试

## 6. 更新项目配置

- [ ] 6.1 更新 `package.json` 添加测试脚本
  ```json
  "test": "vitest",
  "test:run": "vitest run",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
  ```

- [ ] 6.2 更新 `.gitignore` 忽略测试覆盖率文件

- [ ] 6.3 更新 `tsconfig.json` 包含测试文件

## 7. 文档和指南

- [ ] 7.1 创建 `docs/testing-guide.md` 测试指南
  - 测试策略说明
  - 测试模板使用方法
  - Mock 工具使用方法
  - 常见问题解答

- [ ] 7.2 更新 `README.md` 添加测试相关说明

## 8. 验证

- [ ] 8.1 运行 `pnpm test:run` 确保所有测试通过
- [ ] 8.2 运行 `pnpm test:ui` 验证 UI 界面正常
- [ ] 8.3 验证测试覆盖率报告生成正常
- [ ] 8.4 确保 `pnpm qa` 仍然正常工作
