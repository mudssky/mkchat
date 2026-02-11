# chat-streaming Specification

## Purpose

定义聊天流式响应的处理机制，集成 Vercel AI SDK 实现 AI 响应的实时流式显示和状态管理。

## ADDED Requirements

### Requirement: 流式响应处理

系统 **MUST** 使用 Vercel AI SDK 处理 AI 响应的流式传输。

#### Scenario: 发起流式请求

- **GIVEN** 用户发送了一条新消息
- **WHEN** 系统调用 AI API
- **THEN** 系统 **SHALL** 使用 Server-Sent Events (SSE) 建立连接
- **AND** 系统 **SHALL** 在 UI 中显示"正在输入"指示器
- **AND** 系统 **SHALL** 禁用输入框直到响应完成

#### Scenario: 实时渲染 Token

- **GIVEN** AI 开始返回响应流
- **WHEN** 每个 token 到达
- **THEN** 系统 **SHALL** 立即将 token 追加到消息气泡
- **AND** 消息列表 **SHALL** 自动滚动到底部
- **AND** 渲染 **SHALL** 保持流畅，无明显卡顿

#### Scenario: 流式响应完成

- **GIVEN** AI 响应流正在进行中
- **WHEN** 流结束（收到 done 事件）
- **THEN** 系统 **SHALL** 保存完整消息到数据库
- **AND** 系统 **SHALL** 移除"正在输入"指示器
- **AND** 系统 **SHALL** 重新启用输入框
- **AND** 系统 **SHALL** 刷新消息列表数据

### Requirement: 流式错误处理

系统 **MUST** 优雅处理流式传输中的错误。

#### Scenario: 网络中断

- **GIVEN** AI 响应流正在进行中
- **WHEN** 网络连接中断
- **THEN** 系统 **SHALL** 保存已接收的部分内容
- **AND** 系统 **SHALL** 标记消息为"未完成"状态
- **AND** 系统 **SHALL** 显示错误提示"连接中断"
- **AND** 系统 **SHALL** 提供"重试"按钮

#### Scenario: API 错误

- **GIVEN** 用户发送了消息
- **WHEN** AI API 返回错误（如 rate limit, invalid key）
- **THEN** 系统 **SHALL** 显示具体错误信息
- **AND** 系统 **SHALL** 保留用户输入的内容
- **AND** 系统 **SHALL** 提供"重新发送"选项
- **AND** 错误消息 **SHALL** 不保存到数据库

#### Scenario: 超时处理

- **GIVEN** AI 响应流已建立
- **WHEN** 30 秒内没有收到任何数据
- **THEN** 系统 **SHALL** 关闭连接
- **AND** 系统 **SHALL** 显示超时错误
- **AND** 系统 **SHALL** 允许用户重试

### Requirement: 乐观更新

系统 **MUST** 实现乐观 UI 更新以提升用户体验。

#### Scenario: 立即显示用户消息

- **GIVEN** 用户在输入框中输入了"What is AI?"
- **WHEN** 用户点击发送
- **THEN** 系统 **SHALL** 立即在消息列表中显示该消息
- **AND** 消息 **SHALL** 标记为"发送中"状态（显示加载图标）
- **AND** 系统 **SHALL** 在后台保存到数据库
- **AND** 保存成功后 **SHALL** 移除"发送中"标记

#### Scenario: 发送失败回滚

- **GIVEN** 用户消息已乐观显示在 UI
- **WHEN** 保存到数据库失败
- **THEN** 系统 **SHALL** 从消息列表中移除该消息
- **AND** 系统 **SHALL** 恢复输入框中的内容
- **AND** 系统 **SHALL** 显示错误提示
- **AND** 用户 **SHALL** 能够重新发送

### Requirement: 流式状态管理

系统 **MUST** 管理流式响应的各种状态。

#### Scenario: 加载状态

- **GIVEN** 系统正在等待 AI 响应
- **WHEN** 流尚未开始
- **THEN** 系统 **SHALL** 显示"思考中..."提示
- **AND** 最后一条消息下方 **SHALL** 显示脉动动画

#### Scenario: 流式中状态

- **GIVEN** AI 响应流正在进行
- **WHEN** tokens 正在到达
- **THEN** 消息气泡 **SHALL** 显示闪烁的光标
- **AND** 光标 **SHALL** 位于当前内容末尾
- **AND** 消息 **SHALL** 标记为"streaming"状态

#### Scenario: 完成状态

- **GIVEN** AI 响应已完全接收
- **WHEN** 流结束
- **THEN** 系统 **SHALL** 移除光标
- **AND** 消息 **SHALL** 标记为"completed"状态
- **AND** 消息 **SHALL** 显示完成时间戳

### Requirement: 并发控制

系统 **MUST** 控制同时进行的流式请求数量。

#### Scenario: 单一活跃流

- **GIVEN** 一个 AI 响应流正在进行中
- **WHEN** 用户尝试发送新消息
- **THEN** 系统 **SHALL** 阻止发送
- **AND** 发送按钮 **SHALL** 保持禁用状态
- **AND** 系统 **SHALL** 显示提示"请等待当前响应完成"

#### Scenario: 取消进行中的流

- **GIVEN** AI 响应流正在进行中
- **WHEN** 用户点击"停止生成"按钮
- **THEN** 系统 **SHALL** 中止 SSE 连接
- **AND** 系统 **SHALL** 保存已接收的部分内容
- **AND** 消息 **SHALL** 标记为"stopped"状态
- **AND** 系统 **SHALL** 重新启用输入框

### Requirement: 流式数据持久化

系统 **MUST** 在流式响应完成后持久化数据。

#### Scenario: 保存完整响应

- **GIVEN** AI 响应流已完成
- **AND** 完整内容为"AI stands for Artificial Intelligence."
- **WHEN** 系统保存消息
- **THEN** 消息 **SHALL** 保存到 Message 表
- **AND** 消息 **SHALL** 关联正确的 parentId
- **AND** 消息 **SHALL** 包含完整的 content
- **AND** 消息 **SHALL** 设置 role 为 "assistant"

#### Scenario: 保存部分响应

- **GIVEN** 流式响应被用户中断
- **AND** 已接收内容为"AI stands for"
- **WHEN** 系统保存消息
- **THEN** 消息 **SHALL** 保存到数据库
- **AND** 消息 **SHALL** 包含 metadata 字段标记为 incomplete
- **AND** 消息 **SHALL** 在 UI 中显示"未完成"徽章

### Requirement: 流式性能优化

系统 **MUST** 优化流式渲染性能。

#### Scenario: 批量更新

- **GIVEN** AI 正在快速返回 tokens
- **WHEN** 每秒接收超过 50 个 tokens
- **THEN** 系统 **SHALL** 批量处理 tokens（每 50ms 一批）
- **AND** UI 更新频率 **SHALL** 不超过 20 FPS
- **AND** 渲染 **SHALL** 保持流畅

#### Scenario: 长消息处理

- **GIVEN** AI 响应超过 5000 字符
- **WHEN** 系统渲染消息
- **THEN** 消息气泡 **SHALL** 使用虚拟滚动（如需要）
- **AND** Markdown 渲染 **SHALL** 使用防抖（debounce）
- **AND** 代码高亮 **SHALL** 延迟加载

## Related Capabilities

- **chat-ui-components**: 消费流式数据并在 UI 中渲染
- **chat-core**: 提供消息保存和树结构管理
- **data-modeling**: 定义 Message 数据模型
