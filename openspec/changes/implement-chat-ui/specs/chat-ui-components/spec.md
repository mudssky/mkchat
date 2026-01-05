# chat-ui-components Specification

## Purpose

定义聊天界面的核心 UI 组件，包括消息列表、消息气泡、输入框和树状导航，为用户提供现代化的聊天交互体验。

## ADDED Requirements

### Requirement: 消息列表渲染

系统 **MUST** 渲染当前分支的消息序列，并支持分支导航。

#### Scenario: 显示线性消息历史

- **GIVEN** 一个包含 5 条消息的对话主题
- **WHEN** 用户打开聊天页面
- **THEN** 系统 **SHALL** 按时间顺序从上到下显示所有消息
- **AND** 用户消息 **SHALL** 显示在右侧，AI 消息 **SHALL** 显示在左侧

#### Scenario: 显示分支指示器

- **GIVEN** 一条消息有 3 个子分支
- **WHEN** 系统渲染该消息
- **THEN** 消息下方 **SHALL** 显示分支导航按钮
- **AND** 按钮 **SHALL** 显示当前分支索引（如 "1/3"）
- **AND** 用户 **SHALL** 能够点击按钮切换到其他分支

#### Scenario: 空对话状态

- **GIVEN** 一个新创建的对话主题，没有任何消息
- **WHEN** 用户打开聊天页面
- **THEN** 系统 **SHALL** 显示欢迎提示
- **AND** 提示 **SHALL** 包含助手名称和建议的起始问题

### Requirement: 消息气泡组件

系统 **MUST** 使用 Ant Design X Bubble 组件渲染消息内容，并支持交互操作。

#### Scenario: 渲染用户消息

- **GIVEN** 一条角色为 "user" 的消息
- **WHEN** 系统渲染该消息
- **THEN** 消息 **SHALL** 使用蓝色背景
- **AND** 消息 **SHALL** 右对齐
- **AND** 消息 **SHALL** 显示发送时间

#### Scenario: 渲染 AI 消息

- **GIVEN** 一条角色为 "assistant" 的消息
- **WHEN** 系统渲染该消息
- **THEN** 消息 **SHALL** 使用灰色背景
- **AND** 消息 **SHALL** 左对齐
- **AND** 消息 **SHALL** 支持 Markdown 格式渲染
- **AND** 代码块 **SHALL** 包含语法高亮和复制按钮

#### Scenario: 消息操作菜单

- **GIVEN** 用户将鼠标悬停在消息上
- **WHEN** 消息不是最新的叶子节点
- **THEN** 系统 **SHALL** 显示操作按钮
- **AND** 操作按钮 **SHALL** 包含"编辑"和"复制"选项
- **AND** 点击"编辑" **SHALL** 创建新的消息分支

### Requirement: 消息输入组件

系统 **MUST** 提供消息输入界面，支持文本输入和发送控制。

#### Scenario: 基本文本输入

- **GIVEN** 用户在聊天页面
- **WHEN** 用户在输入框中输入文本
- **THEN** 输入框 **SHALL** 支持多行文本
- **AND** 输入框 **SHALL** 自动调整高度（最大 5 行）
- **AND** 按下 Enter **SHALL** 换行
- **AND** 按下 Ctrl+Enter **SHALL** 发送消息

#### Scenario: 发送消息

- **GIVEN** 用户在输入框中输入了"Hello"
- **WHEN** 用户点击发送按钮或按下 Ctrl+Enter
- **THEN** 系统 **SHALL** 验证内容不为空
- **AND** 系统 **SHALL** 触发消息发送流程
- **AND** 输入框 **SHALL** 清空
- **AND** 发送按钮 **SHALL** 在发送期间禁用

#### Scenario: 输入验证

- **GIVEN** 用户在输入框中只输入了空格
- **WHEN** 用户尝试发送消息
- **THEN** 系统 **SHALL** 阻止发送
- **AND** 系统 **SHALL** 显示提示"消息不能为空"

#### Scenario: 草稿保存

- **GIVEN** 用户在输入框中输入了部分内容
- **WHEN** 用户切换到其他页面
- **THEN** 系统 **SHALL** 保存输入内容为草稿
- **AND** 用户返回时 **SHALL** 恢复草稿内容

### Requirement: 分支导航

系统 **MUST** 支持在消息树的不同分支间导航。

#### Scenario: 切换到兄弟分支

- **GIVEN** 当前消息链为 [A → B1 → C1]
- **AND** 消息 B 有另一个子节点 B2
- **WHEN** 用户点击消息 B 的分支导航按钮并选择 B2
- **THEN** 系统 **SHALL** 更新当前分支路径为 [A → B2]
- **AND** 消息列表 **SHALL** 重新渲染显示新分支
- **AND** 输入框 **SHALL** 准备在 B2 下创建新消息

#### Scenario: 分支选择器

- **GIVEN** 一条消息有 4 个子分支
- **WHEN** 用户点击分支导航按钮
- **THEN** 系统 **SHALL** 显示分支选择下拉菜单
- **AND** 每个分支 **SHALL** 显示预览文本（前 50 字符）
- **AND** 当前分支 **SHALL** 高亮显示
- **AND** 用户选择分支后菜单 **SHALL** 关闭

### Requirement: 响应式布局

系统 **MUST** 在不同屏幕尺寸下提供优化的布局。

#### Scenario: 桌面端布局

- **GIVEN** 屏幕宽度 ≥ 768px
- **WHEN** 用户打开聊天页面
- **THEN** 消息列表 **SHALL** 居中显示，最大宽度 800px
- **AND** 输入框 **SHALL** 固定在底部
- **AND** 消息气泡 **SHALL** 有适当的左右边距

#### Scenario: 移动端布局

- **GIVEN** 屏幕宽度 < 768px
- **WHEN** 用户打开聊天页面
- **THEN** 消息列表 **SHALL** 占据全宽
- **AND** 输入框 **SHALL** 紧凑显示
- **AND** 操作按钮 **SHALL** 使用图标而非文字

### Requirement: 键盘导航

系统 **MUST** 支持键盘快捷键操作。

#### Scenario: 快捷键发送

- **GIVEN** 用户焦点在输入框
- **WHEN** 用户按下 Ctrl+Enter (Windows) 或 Cmd+Enter (Mac)
- **THEN** 系统 **SHALL** 发送消息

#### Scenario: 快捷键导航

- **GIVEN** 用户在聊天页面
- **WHEN** 用户按下 Tab 键
- **THEN** 焦点 **SHALL** 在可交互元素间循环
- **AND** 焦点指示器 **SHALL** 清晰可见

## Related Capabilities

- **chat-streaming**: 提供流式响应数据供 UI 组件渲染
- **chat-core**: 提供消息树遍历逻辑
- **data-modeling**: 定义 Message 和 Topic 数据结构
