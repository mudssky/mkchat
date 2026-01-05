# Design: 测试基础设施架构

## Context

项目采用 Next.js 14+ App Router 架构，包含 Server Components、Client Components 和 Server Actions。需要设计一个测试策略，在有限的投入下获得最大的质量保障收益。

### Constraints
- Next.js 特有功能（如 Server Components、Image、Link）在 JSDOM 环境中需要 Mock
- 团队资源有限，需要优先测试高价值模块
- 测试应该快速运行，不阻碍开发流程

### Stakeholders
- 开发团队：需要快速反馈和重构信心
- 项目维护者：需要防止回归问题

## Goals / Non-Goals

### Goals
- 建立快速、可靠的单元测试和组件测试基础设施
- 提供清晰的测试模板和最佳实践指南
- 实现分层测试策略，最大化 ROI
- 集成到现有的 `pnpm qa` 质量检查流程

### Non-Goals
- 不追求 100% 代码覆盖率
- 不对所有组件编写详细测试（仅关键组件）
- 不在此阶段引入完整的 E2E 测试（可作为后续提案）
- 不测试 Server Components（拆分为 Client Components 后测试）

## Decisions

### Decision 1: 选择 Vitest 而非 Jest

**Rationale**:
- Vitest 与 Vite 生态无缝集成
- 启动速度更快（使用 ESM）
- API 与 Jest 兼容，学习曲线低
- 内置 TypeScript 支持
- 更好的 watch 模式体验

**Alternatives considered**:
- Jest: 更成熟但配置复杂，启动较慢
- Playwright Component Testing: 更真实但速度慢，适合 E2E

### Decision 2: 分层测试策略

采用 ROI 驱动的测试金字塔：

| 层级 | 测试对象 | 策略 | ROI | 工具 |
|------|---------|------|-----|------|
| L1 | 纯逻辑/工具函数 | 详细单元测试 | ⭐⭐⭐⭐⭐ | Vitest |
| L2 | 通用 UI 组件 | 快照测试 | ⭐⭐⭐⭐ | Vitest + RTL |
| L3 | 业务组件 | 冒烟测试 | ⭐⭐⭐ | Vitest + RTL |
| L4 | 页面 (E2E) | 关键路径测试 | ⭐⭐⭐⭐⭐ | 未来引入 Playwright |

**Rationale**:
- 纯逻辑最稳定、最容易测试、ROI 最高
- UI 组件用快照测试防止意外变更
- 复杂业务组件只做冒烟测试（能渲染即可）
- E2E 测试成本高，仅测试关键用户路径

### Decision 3: Mock 策略

**集中管理 Next.js Mock**:
- 在 `vitest.setup.ts` 中全局 Mock `next/navigation`
- 在 `test-utils/mocks/` 中提供可复用的 Mock 模块
- 组件测试中可按需覆盖默认 Mock

**Rationale**:
- 避免每个测试文件重复 Mock 代码
- 提供一致的测试环境
- 降低维护成本

### Decision 4: 测试文件组织

采用 **co-location** 策略：
- 组件测试：`ComponentName.test.tsx` 与组件同目录
- 工具函数测试：`utils.test.ts` 与源文件同目录
- 示例测试：`src/__tests__/examples/` 目录

**Rationale**:
- 更容易找到和维护测试
- 符合 Next.js 项目惯例
- 删除代码时不会遗漏测试

## Architecture

```
测试基础设施架构
┌─────────────────────────────────────────┐
│           开发者编写测试                  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         vitest.config.ts                 │
│  - jsdom 环境                            │
│  - 路径别名                              │
│  - setupFiles                            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         vitest.setup.ts                  │
│  - 全局 Mock (next/navigation)          │
│  - jest-dom matchers                    │
│  - 清理钩子                              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│       src/test-utils/                    │
│  - render.tsx (自定义渲染)              │
│  - mocks/ (可复用 Mock)                 │
│  - index.ts (统一导出)                  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         实际测试文件                      │
│  - *.test.ts(x)                         │
│  - 使用模板和工具                        │
└─────────────────────────────────────────┘
```

## Risks / Trade-offs

### Risk 1: Server Components 无法直接测试

**Impact**: Medium  
**Mitigation**: 
- 将 Server Components 拆分为 `<ServerPage>` + `<ClientView>`
- 仅测试 `<ClientView>` 部分
- Server Components 的逻辑提取为纯函数进行测试

### Risk 2: Mock 可能与真实行为不一致

**Impact**: Medium  
**Mitigation**:
- 关键路径使用 E2E 测试验证（未来提案）
- Mock 尽量简单，避免复杂逻辑
- 定期审查 Mock 与实际 API 的一致性

### Risk 3: 测试维护成本

**Impact**: Low  
**Mitigation**:
- 采用快照测试减少手动断言
- 仅测试稳定的公共 API
- 避免测试实现细节

## Migration Plan

### Phase 1: 基础设施搭建（本提案）
1. 安装依赖和配置
2. 创建测试工具库
3. 提供测试模板和示例

### Phase 2: 核心模块测试（后续）
1. 为 `src/lib/` 下的工具函数编写测试
2. 为通用 UI 组件编写快照测试
3. 为关键业务逻辑编写单元测试

### Phase 3: E2E 测试（未来提案）
1. 引入 Playwright
2. 编写关键用户路径测试
3. 集成到 CI/CD

### Rollback Plan
如果测试基础设施导致问题：
1. 移除 `vitest.config.ts` 和 `vitest.setup.ts`
2. 从 `package.json` 移除测试相关依赖和脚本
3. 删除 `src/test-utils/` 和测试文件

## Open Questions

1. **是否需要测试覆盖率门槛？**
   - 建议：初期不设置强制门槛，先建立测试文化
   - 后续可考虑为核心模块设置最低覆盖率（如 80%）

2. **是否在 CI 中运行测试？**
   - 建议：是，在 PR 检查中运行 `pnpm test:run`
   - 需要更新 CI 配置（如有）

3. **是否需要 Visual Regression Testing？**
   - 建议：暂不引入，成本较高
   - 可作为未来优化项
