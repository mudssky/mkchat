## Context
- 现有 UI 以功能实现为主，缺乏一致的视觉体系与页面结构规范
- 目标是提升整体质感与可用性，并保持现有功能与数据结构不变
- 当前存在“全局壳层 + 设置页独立壳层”的双重导航结构，增加认知负担
- 主题设置已存在状态存储，但缺少明确的主题优先级与全局生效契约

## Goals / Non-Goals
- Goals:
  - 建立统一 UI 视觉体系并在核心页面落地
  - 先统一页面模板层，再逐步统一组件细节
  - 形成可复用的页面布局与组件结构
  - 强化聊天与设置页面的层级、反馈与可读性
- Non-Goals:
  - 不调整数据模型、API 或业务流程
  - 不引入新的运行时依赖或 UI 框架

## Decisions
- Decision: 采用路线 A（强统一），以 AppShell + TopBar + PageFrame + ModuleSubNav 作为统一页面模板契约
- Decision: 设置页并入全局导航体系，保留模块级二级导航插槽，不再使用独立壳层割裂主导航
- Decision: 主题策略采用“系统主题优先”，当用户选择 system 时跟随 OS 主题，选择 light/dark 时显式覆盖
- Decision: 使用 CSS 变量 + Tailwind 主题扩展定义设计标记，确保浅色/深色一致性
- Decision: 采用“温暖/科技”风格，使用中文 `Noto Sans SC` + 英文 `Manrope` 的双字体组合
- Decision: 字体通过 Google Fonts 引入，简化资产维护
- Decision: 统一页面模板阶段优先保障信息架构一致性，再推进状态反馈与视觉细节收敛
- Decision: 顶部栏展示助手名、会话名/ID、模型状态与快捷入口
- Decision: 全局导航提供会话列表的顶层入口
- Decision: 关键状态反馈通过统一的 Badge/Alert 样式呈现，减少重复实现

## Template Contract v0

本节定义模板层的字段级契约，作为后续页面改造与组件收敛的统一参照。

### 1) AppShell（全局壳层）

- 职责边界:
  - 负责一级导航、响应式壳层结构、全局主题容器
  - 保证应用内仅存在一层全局壳层，避免“壳层嵌套”
  - 提供模块级二级导航插槽，不承载业务模块状态
- 输入契约:
  - `navItems`: `Array<{ label: string; href: string; icon?: string; match: "exact" | "prefix" }>`
  - `activePath`: `string`
  - `secondaryNavSlot?`: `ReactNode`
  - `children`: `ReactNode`
- 行为契约:
  - Desktop 显示固定主导航；Mobile 显示紧凑导航
  - 导航激活规则由 `match` 控制，避免各页自行实现激活逻辑
  - 一级导航必须包含：首页、会话列表、设置

### 2) TopBar（页面上下文栏）

- 职责边界:
  - 展示页面级上下文，不承载模块级导航树
- 输入契约:
  - `title`: `string`（必填）
  - `subtitle?`: `string`
  - `leading?`: `ReactNode`
  - `status?`: `{ label: string; tone?: "neutral" | "info" | "success" | "warning"; icon?: ReactNode; tooltip?: string }`
  - `actions?`: `ReactNode`
- 行为契约:
  - 标题层级在核心页面保持一致
  - 状态区与操作区位置固定，避免页面间跳变

### 3) PageFrame（内容容器模板）

- 职责边界:
  - 统一主内容区宽度、内边距、纵向节奏
- 输入契约:
  - `widthPreset`: `"home" | "list" | "chat" | "settings"`
  - `density`: `"comfortable" | "compact"`
  - `children`: `ReactNode`
- 行为契约:
  - 不同页面可使用不同宽度预设，但 spacing token 体系一致
  - 输入区、表单区、列表区沿用统一纵向节奏基线

### 4) ModuleSubNav（模块级二级导航插槽）

- 职责边界:
  - 承载模块内部导航（如设置），不替代全局主导航
- 输入契约:
  - `items`: `Array<{ label: string; href: string; icon?: string; match: "exact" | "prefix" }>`
  - `activePath`: `string`
  - `orientation`: `"vertical" | "horizontal"`
- 行为契约:
  - 统一二级导航样式与激活规则
  - 在设置页默认启用，在其他模块按需接入

### 5) Theme Resolution（系统主题优先链路）

- 状态字段:
  - `themeMode`: `"system" | "light" | "dark"`
  - `systemTheme`: `"light" | "dark"`
  - `resolvedTheme`: `"light" | "dark"`
- 解析规则:
  - `themeMode = system` → `resolvedTheme = systemTheme`
  - `themeMode = light|dark` → `resolvedTheme = themeMode`
- 应用约束:
  - 模板层与组件层均消费 `resolvedTheme` 对应语义标记
  - 禁止页面自行定义脱离语义标记的主题分支逻辑

### 6) Route Mapping（模板接入矩阵）

| Route | AppShell | TopBar | ModuleSubNav | PageFrame Preset |
| --- | --- | --- | --- | --- |
| `/` | Yes | Yes | No | `home` |
| `/conversations` | Yes | Yes | No | `list` |
| `/chat/[topicId]` | Yes | Yes | No | `chat` |
| `/settings/*` | Yes | Yes | Yes | `settings` |

### 7) 验收焦点（模板优先阶段）

- 任意主路由仅存在一层全局壳层
- 设置模块通过二级导航插槽呈现，不再使用独立壳层
- 核心页面在标题层级、宽度节奏、导航激活规则上保持一致
- 主题在 `system` 模式下可随 OS 切换，并在模板层与组件层同步生效

## Risks / Trade-offs
- 风格改动影响范围较大 → 拆分为页面级与组件级改动分阶段落地
- 导航结构重组可能影响已有使用路径 → 增加清晰的设置二级导航与入口提示
- 暗色模式细节易遗漏 → 在主题优先级与设计标记阶段统一定义并复用

## Migration Plan
1. 先定义统一页面模板契约（AppShell / TopBar / PageFrame / ModuleSubNav）并完成路由接入
2. 将设置页并入全局导航，收敛双重壳层与双重导航
3. 基于模板契约改造首页、会话列表、聊天页、设置页的布局节奏
4. 建立“系统主题优先”生效链路并补齐设计标记映射
5. 最后统一组件状态反馈与交互细节

## Open Questions
- 已确认采用“温暖/科技”风格，并允许引入新字体家族
- 已确认全局导航需要“会话列表”顶层入口
- 已确认采用路线 A（强统一）并优先统一页面模板层
- 已确认主题策略为“系统主题优先”
- 已确认设置页并入全局导航体系
