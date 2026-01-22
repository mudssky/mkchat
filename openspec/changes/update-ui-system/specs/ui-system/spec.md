# ui-system Specification

## Purpose

定义全局 UI 视觉体系与页面布局规范，确保聊天、设置与首页在视觉和交互上保持一致，并提供清晰的导航与状态反馈。

## ADDED Requirements

### Requirement: 视觉设计标记

系统 **MUST** 定义统一的颜色、排版、间距、圆角、阴影与背景层级标记，并在核心页面与组件中复用。

#### Scenario: 主题切换
- **GIVEN** 用户在通用设置中切换主题模式
- **WHEN** 主题从浅色切换到深色
- **THEN** 所有页面与组件 **SHALL** 依据同一组设计标记更新颜色与对比度
- **AND** 文字与背景对比度 **SHALL** 满足可读性要求

#### Scenario: 字体体系
- **GIVEN** 应用加载全局字体
- **WHEN** 页面渲染完成
- **THEN** 系统 **SHALL** 使用中文 `Noto Sans SC` 与英文 `Manrope` 的双字体组合
- **AND** 字体资源 **SHALL** 通过 Google Fonts 提供

### Requirement: 应用壳层与导航

系统 **MUST** 提供一致的应用壳层，包括顶部栏、页面容器与导航区域，以展示当前上下文并支持快速跳转。

#### Scenario: 页面上下文展示
- **GIVEN** 用户进入聊天页面
- **WHEN** 页面完成渲染
- **THEN** 顶部栏 **SHALL** 展示助手名称与会话标识
- **AND** 顶部栏 **SHALL** 显示当前模型状态
- **AND** 顶部栏 **SHALL** 提供快捷入口（如设置）
- **AND** 导航区域 **SHALL** 提供返回首页与设置的入口

#### Scenario: 会话列表入口
- **GIVEN** 用户在任意页面
- **WHEN** 导航区域渲染
- **THEN** 导航区域 **SHALL** 提供“会话列表”的顶层入口

### Requirement: 页面布局与节奏

系统 **MUST** 为核心页面提供一致的版式节奏与信息层级。

#### Scenario: 设置页结构
- **GIVEN** 用户进入设置页面
- **WHEN** 页面渲染
- **THEN** 配置模块 **SHALL** 以卡片化区块呈现
- **AND** 表单控件 **SHALL** 对齐并保持一致的间距

#### Scenario: 聊天页结构
- **GIVEN** 用户进入聊天页面
- **WHEN** 页面渲染
- **THEN** 消息区域 **SHALL** 使用统一的最大宽度
- **AND** 输入区 **SHALL** 固定在页面底部并与消息区域视觉对齐

### Requirement: 状态与反馈

系统 **MUST** 使用一致的视觉样式呈现加载、空状态、错误与消息状态反馈。

#### Scenario: 空状态
- **GIVEN** 用户进入一个没有消息的会话
- **WHEN** 页面渲染
- **THEN** 系统 **SHALL** 展示带有引导文案的空状态
- **AND** 空状态 **SHALL** 提供可操作的建议入口

#### Scenario: 错误状态
- **GIVEN** 页面加载失败
- **WHEN** 错误发生
- **THEN** 系统 **SHALL** 展示清晰的错误信息与重试入口

### Requirement: 交互与动效

系统 **MUST** 为关键交互提供可感知的过渡与焦点反馈。

#### Scenario: 交互反馈
- **GIVEN** 用户悬停按钮或聚焦输入框
- **WHEN** 交互状态改变
- **THEN** 组件 **SHALL** 显示清晰的悬停与焦点样式
- **AND** 状态变化 **SHALL** 使用平滑过渡避免突兀跳变

## Related Capabilities

- **chat-ui-components**: 聊天界面组件需要应用统一视觉规范
- **settings-core**: 设置功能保持不变，界面样式按 UI 体系统一
