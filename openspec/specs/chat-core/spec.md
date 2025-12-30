# chat-core Specification

## Purpose
TBD - created by archiving change scaffold-core-app. Update Purpose after archive.
## Requirements
### Requirement: Context Window Construction

系统 **MUST** 从消息树构建线性历史。

#### Scenario: Sending a new message

- **Given** 当前叶子消息 ID
- **When** 为 LLM 准备上下文
- **Then** 系统 **SHALL** 向上遍历 `parentId` 直至根节点，以构建对话历史

### Requirement: Branching

系统 **MUST** 为消息编辑创建兄弟节点。

#### Scenario: User edits a previous message

- **Given** 一个现有的消息节点
- **When** 用户提交 "Edit"
- **Then** 一个新的 Message 节点 **SHALL** 被创建，且具有与原始消息相同的 `parentId`, 从而创建一个分支

