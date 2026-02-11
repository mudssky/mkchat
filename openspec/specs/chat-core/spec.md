# chat-core Specification

## Purpose

定义聊天核心功能，包括消息树结构、上下文构建、分支对话和自动标题生成。

## Requirements

### Requirement: Context Window Construction

系统 **MUST** 从消息树构建线性历史。

#### Scenario: Sending a new message

- **Given** 当前叶子消息 ID
- **WHEN** 为 LLM 准备上下文
- **THEN** 系统 **SHALL** 向上遍历 `parentId` 直至根节点，以构建对话历史

### Requirement: Branching

系统 **MUST** 为消息编辑创建兄弟节点。

#### Scenario: User edits a previous message

- **Given** 一个现有的消息节点
- **When** 用户提交 "Edit"
- **Then** 一个新的 Message 节点 **SHALL** 被创建，且具有与原始消息相同的 `parentId`, 从而创建一个分支

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

### Requirement: Topic Deletion API

系统 **MUST** 提供 DELETE 端点用于永久删除 Topic。

#### Scenario: Delete topic successfully

- **WHEN** 客户端发送 `DELETE /api/topics/{id}` 请求，且 Topic 存在
- **THEN** 系统 **SHALL** 永久删除该 Topic 及其所有关联 Message
- **AND** 系统 **SHALL** 返回 HTTP 200

#### Scenario: Delete non-existent topic

- **WHEN** 客户端发送 `DELETE /api/topics/{id}` 请求，且 Topic 不存在
- **THEN** 系统 **SHALL** 返回 HTTP 404

### Requirement: Topic List API

系统 **MUST** 提供独立的 GET 端点用于查询 Topic 列表。

#### Scenario: List active topics with default sorting

- **WHEN** 客户端发送 `GET /api/topics`（无查询参数）
- **THEN** 系统 **SHALL** 返回所有 `archivedAt = null` 的 Topic
- **AND** 置顶 Topic（`pinned = true`）**SHALL** 排在列表最前
- **AND** 非置顶 Topic **SHALL** 按 `updatedAt` 降序排列

#### Scenario: Search topics by title

- **WHEN** 客户端发送 `GET /api/topics?search=TypeScript`
- **THEN** 系统 **SHALL** 返回 `title` 包含 "TypeScript"（不区分大小写）的 Topic 列表

#### Scenario: List archived topics

- **WHEN** 客户端发送 `GET /api/topics?archived=true`
- **THEN** 系统 **SHALL** 返回所有 `archivedAt != null` 的 Topic

#### Scenario: Sort by creation time

- **WHEN** 客户端发送 `GET /api/topics?sort=createdAt&order=asc`
- **THEN** 系统 **SHALL** 按 `createdAt` 升序排列 Topic 列表

#### Scenario: Filter by assistant

- **WHEN** 客户端发送 `GET /api/topics?assistantId=xxx`
- **THEN** 系统 **SHALL** 仅返回属于该 Assistant 的 Topic

### Requirement: Topic Archive and Pin via PATCH

系统 **MUST** 扩展 PATCH 端点以支持更新 `pinned` 和 `archivedAt`。

#### Scenario: Pin a topic via PATCH

- **WHEN** 客户端发送 `PATCH /api/topics/{id}` 请求，body 为 `{ "pinned": true }`
- **THEN** 系统 **SHALL** 将该 Topic 的 `pinned` 设置为 `true`

#### Scenario: Archive a topic via PATCH

- **WHEN** 客户端发送 `PATCH /api/topics/{id}` 请求，body 为 `{ "archivedAt": "2026-02-11T00:00:00Z" }`
- **THEN** 系统 **SHALL** 将该 Topic 的 `archivedAt` 设置为传入的时间戳

#### Scenario: Unarchive a topic via PATCH

- **WHEN** 客户端发送 `PATCH /api/topics/{id}` 请求，body 为 `{ "archivedAt": null }`
- **THEN** 系统 **SHALL** 将该 Topic 的 `archivedAt` 重置为 `null`，恢复为活跃状态

### Requirement: Topic Response Includes New Fields

系统 **MUST** 在 Topic 相关的 API 响应中包含新增字段。

#### Scenario: GET topic includes pinned and archivedAt

- **WHEN** 客户端请求 `GET /api/topics/{id}`
- **THEN** 响应 **SHALL** 包含 `pinned: boolean` 和 `archivedAt: string | null` 字段

#### Scenario: Topic list items include assistant name

- **WHEN** 客户端请求 `GET /api/topics`
- **THEN** 每个 Topic 项 **SHALL** 包含关联的 `assistant.name` 和 `assistant.modelId`

