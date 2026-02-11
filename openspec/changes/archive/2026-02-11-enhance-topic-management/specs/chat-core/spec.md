## ADDED Requirements

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
