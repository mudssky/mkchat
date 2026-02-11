## MODIFIED Requirements

### Requirement: Branching

系统 **MUST** 为消息编辑创建兄弟节点，并支持多模型对比产生的并行分支。

#### Scenario: User edits a previous message

- **Given** 一个现有的消息节点
- **When** 用户提交 "Edit"
- **Then** 一个新的 Message 节点 **SHALL** 被创建，且具有与原始消息相同的 `parentId`, 从而创建一个分支

#### Scenario: Multi-model comparison creates sibling branches

- **WHEN** 用户发起多模型对比请求，选择了 N 个模型（2 ≤ N ≤ 4）
- **THEN** 系统 **SHALL** 创建 1 条用户消息节点
- **AND** 系统 **SHALL** 为每个模型创建 1 条 assistant 回复节点，所有回复节点 **SHALL** 共享同一个 `parentId`（即该用户消息 ID）
- **AND** 每个 assistant 回复的 `metadata` **SHALL** 包含 `compareGroupId`（UUID，标识同一轮对比）、`compareModelId`（实际使用的 modelId）、`compareProviderName`（Provider 名称）

#### Scenario: Compare group siblings are identifiable

- **WHEN** 查询某条用户消息的子节点
- **AND** 子节点的 `metadata.compareGroupId` 相同
- **THEN** 系统 **SHALL** 将这些子节点识别为同一轮对比的结果

## ADDED Requirements

### Requirement: Compare Request API Extension

系统 **MUST** 扩展 `POST /api/chat` 以支持对比模式请求。

#### Scenario: First compare request creates user message

- **WHEN** 客户端发送 `POST /api/chat` 请求，且请求中不包含 `compareParentId` 字段
- **THEN** API **SHALL** 正常创建用户消息并生成 AI 回复（与现有行为一致）

#### Scenario: Subsequent compare request skips user message creation

- **WHEN** 客户端发送 `POST /api/chat` 请求，且请求中包含 `compareParentId`（指向已存在的用户消息 ID）
- **THEN** API **SHALL NOT** 创建新的用户消息
- **AND** API **SHALL** 使用 `compareParentId` 作为 AI 回复的 `parentId`
- **AND** API **SHALL** 使用请求中指定的 `assistantId` 对应的 ProviderConfig 和 modelId 生成回复

#### Scenario: Compare request with invalid compareParentId

- **WHEN** 客户端发送 `POST /api/chat` 请求，且 `compareParentId` 指向不存在的消息
- **THEN** API **SHALL** 返回 HTTP 400 错误

#### Scenario: Compare metadata is persisted

- **WHEN** 对比模式下 AI 回复完成（`onFinish` 触发）
- **THEN** 系统 **SHALL** 在 assistant 消息的 `metadata` 中包含 `compareGroupId`、`compareModelId` 和 `compareProviderName`

### Requirement: Multi-Model Response Vote

系统 **MUST** 支持用户对对比回复进行评价。

#### Scenario: Vote on a compare response

- **WHEN** 用户对某条带有 `compareGroupId` 的 assistant 消息点击「赞」或「踩」
- **THEN** 系统 **SHALL** 更新该消息的 `metadata.vote` 为 `"up"` 或 `"down"`
- **AND** 系统 **SHALL** 通过 `PATCH /api/messages/{id}` 持久化投票

#### Scenario: Change vote

- **WHEN** 用户对已投票的消息再次点击另一选项
- **THEN** 系统 **SHALL** 更新 `metadata.vote` 为新值

#### Scenario: Remove vote

- **WHEN** 用户对已投票的消息再次点击相同选项
- **THEN** 系统 **SHALL** 移除 `metadata.vote`（设为 `null`）
