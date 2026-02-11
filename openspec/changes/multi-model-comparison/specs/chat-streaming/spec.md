## MODIFIED Requirements

### Requirement: 并发控制

系统 **MUST** 控制同时进行的流式请求数量，并支持对比模式下的并行流。

#### Scenario: 单一活跃流（普通模式）

- **GIVEN** 一个 AI 响应流正在进行中（普通模式）
- **WHEN** 用户尝试发送新消息
- **THEN** 系统 **SHALL** 阻止发送
- **AND** 发送按钮 **SHALL** 保持禁用状态
- **AND** 系统 **SHALL** 显示提示"请等待当前响应完成"

#### Scenario: 对比模式并行流

- **GIVEN** 用户发起了多模型对比请求（N 个模型）
- **WHEN** N 个流式请求同时进行中
- **THEN** 系统 **SHALL** 允许 N 个流并行进行
- **AND** 发送按钮 **SHALL** 保持禁用直到所有流完成或被取消
- **AND** 系统 **SHALL** 显示「停止全部」按钮

#### Scenario: 取消进行中的流

- **GIVEN** AI 响应流正在进行中
- **WHEN** 用户点击"停止生成"按钮
- **THEN** 系统 **SHALL** 中止 SSE 连接
- **AND** 系统 **SHALL** 保存已接收的部分内容
- **AND** 消息 **SHALL** 标记为"stopped"状态
- **AND** 系统 **SHALL** 重新启用输入框

#### Scenario: 取消对比模式所有流

- **GIVEN** 多个对比流正在进行中
- **WHEN** 用户点击「停止全部」按钮
- **THEN** 系统 **SHALL** 中止所有进行中的 SSE 连接
- **AND** 已接收的部分内容 **SHALL** 各自保存
- **AND** 系统 **SHALL** 重新启用输入框

### Requirement: 流式状态管理

系统 **MUST** 管理流式响应的各种状态，包括对比模式下各流的独立状态。

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

#### Scenario: 对比模式独立状态

- **GIVEN** 多模型对比中有 3 个并行流
- **WHEN** 模型 A 已完成但模型 B 和 C 仍在流式中
- **THEN** 模型 A 的回复列 **SHALL** 显示"completed"状态
- **AND** 模型 B 和 C 的回复列 **SHALL** 各自显示独立的流式状态
- **AND** 全局状态 **SHALL** 保持为"streaming"直到所有流完成

## ADDED Requirements

### Requirement: 对比流并行管理

系统 **MUST** 提供 `useCompareChat` hook 管理多模型并行流式请求。

#### Scenario: 发起对比请求

- **WHEN** 用户通过对比模式发送消息，选择了 N 个模型
- **THEN** `useCompareChat` **SHALL** 按顺序发起 N 个 `POST /api/chat` 请求
- **AND** 第一个请求 **SHALL** 正常创建用户消息
- **AND** 后续 N-1 个请求 **SHALL** 携带 `compareParentId` 以跳过用户消息创建
- **AND** 所有请求 **SHALL** 携带相同的 `compareGroupId`

#### Scenario: 独立流解析

- **GIVEN** N 个流式请求已发起
- **WHEN** 各流返回 SSE 数据
- **THEN** 系统 **SHALL** 独立解析每个流的 AI SDK Data Stream Protocol
- **AND** 每个流的内容 **SHALL** 独立更新到对应的 state 中
- **AND** 任何一个流的失败 **SHALL NOT** 影响其他流

#### Scenario: 全部流完成

- **WHEN** 所有 N 个流都已完成（成功或失败）
- **THEN** `useCompareChat` **SHALL** 触发 TanStack Query 的数据刷新
- **AND** 系统 **SHALL** 重新启用输入框
- **AND** CompareView **SHALL** 从本地 state 切换为使用 DB 持久化数据
