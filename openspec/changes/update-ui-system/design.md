## Context
- 现有 UI 以功能实现为主，缺乏一致的视觉体系与页面结构规范
- 目标是提升整体质感与可用性，并保持现有功能与数据结构不变

## Goals / Non-Goals
- Goals:
  - 建立统一 UI 视觉体系并在核心页面落地
  - 形成可复用的页面布局与组件结构
  - 强化聊天与设置页面的层级、反馈与可读性
- Non-Goals:
  - 不调整数据模型、API 或业务流程
  - 不引入新的运行时依赖或 UI 框架

## Decisions
- Decision: 使用 CSS 变量 + Tailwind 主题扩展定义设计标记，确保浅色/深色一致性
- Decision: 采用“温暖/科技”风格，使用中文 `Noto Sans SC` + 英文 `Manrope` 的双字体组合
- Decision: 字体通过 Google Fonts 引入，简化资产维护
- Decision: 新增 AppShell 布局组件统一顶部栏、页面容器与导航结构
- Decision: 顶部栏展示助手名、会话名/ID、模型状态与快捷入口
- Decision: 全局导航提供会话列表的顶层入口
- Decision: 关键状态反馈通过统一的 Badge/Alert 样式呈现，减少重复实现

## Risks / Trade-offs
- 风格改动影响范围较大 → 拆分为页面级与组件级改动分阶段落地
- 暗色模式细节易遗漏 → 在设计标记阶段统一定义并复用

## Migration Plan
1. 落地设计标记与 AppShell，保证全局基础样式稳定
2. 分别改造首页、聊天页、设置页
3. 最后统一调整组件细节与交互反馈

## Open Questions
- 已确认采用“温暖/科技”风格，并允许引入新字体家族
- 已确认全局导航需要“会话列表”顶层入口
