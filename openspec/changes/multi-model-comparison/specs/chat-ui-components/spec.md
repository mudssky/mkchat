## MODIFIED Requirements

### Requirement: 消息列表渲染

系统 **MUST** 渲染当前分支的消息序列，并支持分支导航和多模型对比并排展示。

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

#### Scenario: 对比回复并排展示

- **GIVEN** 当前叶子消息的父节点（用户消息）有多个子节点，且这些子节点共享相同的 `metadata.compareGroupId`
- **WHEN** 系统渲染消息列表
- **THEN** 用户消息之前的消息链 **SHALL** 以正常列表形式渲染
- **AND** 用户消息之后 **SHALL** 渲染 CompareView 组件，将所有对比回复并排展示
- **AND** CompareView **SHALL NOT** 替代 MessageList，而是作为最后一组消息的替代渲染方式

### Requirement: 消息气泡组件

系统 **MUST** 使用 Ant Design X Bubble 组件渲染消息内容，并支持交互操作和模型标识。

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

#### Scenario: 对比回复显示模型标识

- **GIVEN** 一条 assistant 消息的 `metadata` 包含 `compareModelId` 和 `compareProviderName`
- **WHEN** 系统渲染该消息
- **THEN** 消息气泡顶部 **SHALL** 显示模型名称标签（如 "GPT-4o" 或 "Claude Sonnet"）
- **AND** 标签 **SHALL** 使用不同颜色区分不同 Provider

#### Scenario: 消息操作菜单

- **GIVEN** 用户将鼠标悬停在消息上
- **WHEN** 消息不是最新的叶子节点
- **THEN** 系统 **SHALL** 显示操作按钮
- **AND** 操作按钮 **SHALL** 包含"编辑"和"复制"选项
- **AND** 点击"编辑" **SHALL** 创建新的消息分支

### Requirement: 消息输入组件

系统 **MUST** 提供消息输入界面，支持文本输入、发送控制和对比模式触发。

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

#### Scenario: 对比模式发送

- **GIVEN** 用户已通过对比按钮选择了多个模型
- **WHEN** 用户点击发送按钮或按下 Ctrl+Enter
- **THEN** 系统 **SHALL** 进入对比发送流程（而非普通发送）
- **AND** 输入框 **SHALL** 清空
- **AND** 发送按钮和对比按钮 **SHALL** 在所有流完成前禁用

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

## ADDED Requirements

### Requirement: 对比视图组件

系统 **MUST** 提供 CompareView 组件，并排展示同一轮对比中各模型的回复。

#### Scenario: 并排渲染对比回复

- **GIVEN** 同一 `compareGroupId` 下有 3 个 assistant 回复
- **WHEN** CompareView 渲染
- **THEN** 系统 **SHALL** 将 3 个回复水平并排显示，每个占据等宽列
- **AND** 每列顶部 **SHALL** 显示模型名称和 Provider 标识
- **AND** 每列 **SHALL** 独立滚动

#### Scenario: 对比中流式渲染

- **GIVEN** 多个模型正在并行返回流式回复
- **WHEN** CompareView 渲染
- **THEN** 每列 **SHALL** 独立显示流式状态（思考中 / 流式中 / 完成）
- **AND** 已完成的列 **SHALL** 显示完成标记，不影响仍在流式中的列

#### Scenario: 对比回复投票

- **GIVEN** CompareView 中显示多个对比回复
- **WHEN** 用户对某个回复点击「👍」或「👎」
- **THEN** 系统 **SHALL** 记录投票到该消息的 `metadata.vote`
- **AND** 投票按钮 **SHALL** 高亮显示当前投票状态

#### Scenario: 从对比回复继续对话

- **GIVEN** CompareView 中显示多个对比回复
- **WHEN** 用户点击某个回复的「继续对话」按钮
- **THEN** 系统 **SHALL** 将该回复设为当前分支叶子节点
- **AND** 系统 **SHALL** 退出对比视图，恢复普通消息列表
- **AND** MessageInput **SHALL** 准备在该回复下创建新消息

#### Scenario: 对比视图响应式布局

- **GIVEN** 屏幕宽度 < 768px
- **WHEN** CompareView 渲染
- **THEN** 对比列 **SHALL** 切换为垂直堆叠布局（而非水平并排）
- **AND** 每个回复 **SHALL** 以完整宽度显示

### Requirement: 模型选择器

系统 **MUST** 提供 ModelPicker 组件，允许用户选择多个模型进行对比。

#### Scenario: 打开模型选择器

- **WHEN** 用户点击 MessageInput 旁的「对比」按钮
- **THEN** 系统 **SHALL** 显示 ModelPicker 弹出面板
- **AND** 面板 **SHALL** 列出所有已配置 Provider 下的可用模型
- **AND** 模型 **SHALL** 按 Provider 分组显示

#### Scenario: 选择对比模型

- **GIVEN** ModelPicker 已打开
- **WHEN** 用户选中 2-4 个模型
- **THEN** 系统 **SHALL** 在 MessageInput 区域显示已选模型标签
- **AND** 每个标签 **SHALL** 可单独移除
- **AND** 选择数量 **SHALL** 限制在 2-4 个之间

#### Scenario: 无可用模型

- **GIVEN** 用户未配置任何 Provider
- **WHEN** 用户点击「对比」按钮
- **THEN** 系统 **SHALL** 显示提示"请先在设置中配置至少 2 个模型"
- **AND** 提示 **SHALL** 包含跳转到设置页面的链接

#### Scenario: 模型选择持久化

- **WHEN** 用户选择了对比模型并关闭 ModelPicker
- **THEN** 选择 **SHALL** 保留直到用户手动清除或完成一次对比发送
