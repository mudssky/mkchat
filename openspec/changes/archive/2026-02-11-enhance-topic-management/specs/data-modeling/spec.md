## MODIFIED Requirements

### Requirement: Tree-based Message Model

Messages **MUST** 支持递归父子关系。

#### Scenario: Storing a reply

- **Given** 一个父消息 ID
- **When** 一条新消息被保存
- **Then** `parentId` 字段 **SHALL** 引用前一条消息

#### Scenario: Cascade delete with topic

- **WHEN** 一个 Topic 被删除
- **THEN** 关联的所有 Message 记录 **SHALL** 被级联删除（`onDelete: Cascade`）

## ADDED Requirements

### Requirement: Topic Pinned State

Topic **MUST** 支持置顶标记。

#### Scenario: Topic has pinned field

- **WHEN** 创建新 Topic
- **THEN** `pinned` 字段 **SHALL** 默认为 `false`

#### Scenario: Pin a topic

- **WHEN** 用户将 Topic 置顶
- **THEN** `pinned` 字段 **SHALL** 更新为 `true`

### Requirement: Topic Archive State

Topic **MUST** 支持归档状态。

#### Scenario: Topic has archivedAt field

- **WHEN** 创建新 Topic
- **THEN** `archivedAt` 字段 **SHALL** 默认为 `null`，表示活跃状态

#### Scenario: Archive a topic

- **WHEN** 用户归档 Topic
- **THEN** `archivedAt` 字段 **SHALL** 设置为当前时间戳

#### Scenario: Unarchive a topic

- **WHEN** 用户恢复已归档的 Topic
- **THEN** `archivedAt` 字段 **SHALL** 重置为 `null`
