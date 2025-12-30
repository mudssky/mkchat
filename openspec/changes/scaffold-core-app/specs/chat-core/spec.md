# Spec: Chat Core

## ADDED Requirements

### Requirement: Context Window Construction
系统必须从消息树构建线性历史。

#### Scenario: Sending a new message
- **Given** 当前叶子消息 ID
- **When** 为 LLM 准备上下文时
- **Then** 系统应向上遍历 `parentId` 直至根节点，以构建对话历史

### Requirement: Branching
系统必须为消息编辑创建 siblings。

#### Scenario: User edits a previous message
- **Given** 一个现有的消息节点
- **When** 用户提交 "编辑" 时
- **Then** 应创建一个新的消息节点，其 `parentId` 与原始消息相同，从而创建一个分支
