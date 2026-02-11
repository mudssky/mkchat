## MODIFIED Requirements

### Requirement: Context Window Construction

系统 **MUST** 从消息树构建线性历史。

#### Scenario: Sending a new message

- **Given** 当前叶子消息 ID
- **WHEN** 为 LLM 准备上下文
- **THEN** 系统 **SHALL** 向上遍历 `parentId` 直至根节点，以构建对话历史

## ADDED Requirements

### Requirement: Auto Topic Title Generation

系统 **MUST** 在首次 AI 回复完成后自动为对话生成简短中文标题。

#### Scenario: First AI response completes for untitled topic

- **WHEN** `streamText` 的 `onFinish` 回调触发，且当前 `Topic.title` 为 `null`
- **THEN** 系统 **SHALL** 异步调用轻量 LLM 生成一个不超过 20 字的中文标题，并将结果写入 `Topic.title`

#### Scenario: Title generation does not block chat response

- **WHEN** 标题生成被触发
- **THEN** 标题生成 **SHALL** 以 fire-and-forget 方式执行，**MUST NOT** 阻塞主流式响应的返回

#### Scenario: Title generation fails gracefully

- **WHEN** 标题生成过程中发生错误（网络超时、API 限流、模型不可用）
- **THEN** 系统 **SHALL** 记录 warning 日志，`Topic.title` 保持为 `null`，不影响聊天功能

#### Scenario: Title is not overwritten by auto-generation

- **WHEN** `streamText` 的 `onFinish` 回调触发，且当前 `Topic.title` 已有值（非 `null`）
- **THEN** 系统 **SHALL NOT** 触发标题生成

### Requirement: Topic Title Update API

系统 **MUST** 提供 PATCH 端点用于更新 Topic 标题。

#### Scenario: Update topic title via PATCH

- **WHEN** 客户端发送 `PATCH /api/topics/{id}` 请求，body 为 `{ "title": "新标题" }`
- **THEN** 系统 **SHALL** 更新对应 Topic 的 `title` 字段并返回更新后的 Topic 对象

#### Scenario: PATCH with invalid topic ID

- **WHEN** 客户端发送 `PATCH /api/topics/{id}` 请求，且 ID 对应的 Topic 不存在
- **THEN** 系统 **SHALL** 返回 HTTP 404

#### Scenario: PATCH with empty title

- **WHEN** 客户端发送 `PATCH /api/topics/{id}` 请求，body 为 `{ "title": "" }`
- **THEN** 系统 **SHALL** 返回 HTTP 400 校验错误

### Requirement: Lightweight Model Selection for Title Generation

系统 **MUST** 为标题生成选择成本最低的可用模型。

#### Scenario: OpenAI provider

- **WHEN** Assistant 绑定的 ProviderConfig 类型为 `openai`
- **THEN** 标题生成 **SHALL** 使用 `gpt-4o-mini` 模型

#### Scenario: Anthropic provider

- **WHEN** Assistant 绑定的 ProviderConfig 类型为 `anthropic`
- **THEN** 标题生成 **SHALL** 使用 `claude-haiku-4-20250414` 模型

#### Scenario: Lightweight model unavailable fallback

- **WHEN** 轻量模型调用失败（模型 ID 不被自定义 Provider 识别）
- **THEN** 系统 **SHALL** 回退使用 Assistant 配置的原始 `modelId`

### Requirement: Frontend Title Refresh

前端 **MUST** 在标题生成后自动展示更新后的标题。

#### Scenario: Title appears after generation completes

- **WHEN** 标题生成完成并写入数据库
- **THEN** 前端 **SHALL** 在下一次 TanStack Query refetch 时获取新标题并更新 TopBar 和侧栏显示
