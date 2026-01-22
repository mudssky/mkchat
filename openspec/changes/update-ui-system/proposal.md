# Change: update-ui-system

## Why

当前 UI 视觉体系偏基础，聊天页与设置页在间距、排版与状态反馈上缺乏一致性，首页缺少明确的产品定位与引导。这会降低产品的专业感与使用效率，也不符合 Cherry Studio 类产品的体验预期。

## What Changes

- **建立 UI 视觉体系**：定义颜色、排版、间距、圆角、阴影与背景层级，统一应用全局设计标记
- **更新字体体系**：采用 Google Fonts 引入 `Noto Sans SC` 与 `Manrope` 的双字体组合
- **引入应用壳层**：提供一致的顶部栏与页面容器结构，统一导航与上下文信息展示
- **新增会话列表入口**：在全局导航中提供会话列表的顶层入口
- **优化聊天页面结构**：调整信息密度、输入区层级、状态提示与空状态引导
- **优化设置页面布局**：使用卡片化结构统一表单节奏、空状态与编辑流程
- **补充交互与动效**：为关键交互提供可感知的反馈与过渡

## Impact

**受影响的 specs**:
- **ui-system** (新增)：定义全局视觉体系、布局模板与交互反馈需求
- **chat-ui-components** (依赖)：优化消息列表、输入区与状态反馈的呈现规范
- **settings-core** (依赖)：保持配置能力不变，仅提升界面体验

**受影响的代码**:
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/page.tsx`
- `src/app/(main)/chat/[topicId]/page.tsx`
- `src/components/chat/*`
- `src/app/(main)/settings/layout.tsx`
- `src/components/settings/*`
- `src/components/layout/*` (新增)
- `src/components/conversations/*` (新增)

**风险**:
- 视觉改动范围大，可能影响现有交互习惯 → 提前定义统一组件规范并分阶段落地
- 暗色主题兼容成本增加 → 在设计标记阶段统一覆盖
