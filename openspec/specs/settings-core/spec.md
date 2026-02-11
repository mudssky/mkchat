# settings-core Specification

## Purpose
TBD - created by archiving change design-settings-page. Update Purpose after archive.
## Requirements
### Requirement: Settings Persistence

系统 **MUST** 将用户配置持久化到本地存储。

#### Scenario: User reloads page
- **Given** 用户修改了配置 (如 Theme)
- **When** 用户刷新页面或重新打开应用
- **Then** 应用 **SHALL** 恢复之前的配置状态

### Requirement: Provider Configuration

系统 **MUST** 允许用户配置主流 LLM 提供商 (OpenAI, Anthropic 等) 的认证信息。

#### Scenario: Configure OpenAI Key
- **Given** 用户在 Provider 设置页
- **When** 用户输入 API Key
- **Then** 系统 **SHALL** 安全保存该 Key (在本地)

### Requirement: MCP Server Management

系统 **MUST** 支持动态添加和移除 MCP Server 连接。

#### Scenario: Add New Server
- **Given** MCP 设置面板
- **When** 用户输入新的 MCP Server SSE URL 并确认
- **Then** 系统 **SHALL** 记录该 URL 并尝试建立连接

### Requirement: Topic Context Menu

系统 **MUST** 在会话列表中为每个 Topic 提供上下文操作菜单。

#### Scenario: Show context menu on hover

- **WHEN** 用户将鼠标悬停在会话列表中的某个 Topic 上
- **THEN** 系统 **SHALL** 在该行右侧显示 `⋮` 更多操作按钮

#### Scenario: Context menu items

- **WHEN** 用户点击 `⋮` 按钮或右键点击 Topic 行
- **THEN** 系统 **SHALL** 显示包含以下选项的菜单：重命名、置顶/取消置顶、归档、删除
- **AND** 置顶选项 **SHALL** 根据当前状态显示为"置顶"或"取消置顶"

### Requirement: Inline Topic Rename

系统 **MUST** 支持在会话列表中内联编辑 Topic 标题。

#### Scenario: Enter rename mode

- **WHEN** 用户从上下文菜单选择"重命名"
- **THEN** Topic 标题 **SHALL** 切换为可编辑的 input 元素
- **AND** 当前标题文本 **SHALL** 被选中

#### Scenario: Confirm rename

- **WHEN** 用户在内联编辑中按下 Enter 键或点击外部区域
- **THEN** 系统 **SHALL** 调用 `PATCH /api/topics/{id}` 更新标题
- **AND** 列表 **SHALL** 显示更新后的标题

#### Scenario: Cancel rename

- **WHEN** 用户在内联编辑中按下 Esc 键
- **THEN** 系统 **SHALL** 恢复原始标题，不发送 API 请求

### Requirement: Topic Delete Confirmation

系统 **MUST** 在删除 Topic 前要求用户确认。

#### Scenario: Show delete confirmation

- **WHEN** 用户从上下文菜单选择"删除"
- **THEN** 系统 **SHALL** 弹出确认对话框
- **AND** 对话框 **SHALL** 明确告知"删除后所有消息将被永久删除，不可恢复"

#### Scenario: Confirm delete

- **WHEN** 用户在确认对话框中点击"删除"
- **THEN** 系统 **SHALL** 调用 `DELETE /api/topics/{id}` 并从列表中移除该 Topic

#### Scenario: Cancel delete

- **WHEN** 用户在确认对话框中点击"取消"
- **THEN** 系统 **SHALL** 关闭对话框，Topic 保持不变

### Requirement: Topic Search

系统 **MUST** 在会话列表顶部提供搜索功能。

#### Scenario: Search input

- **WHEN** 用户在搜索框中输入关键词
- **THEN** 系统 **SHALL** 延迟 300ms（debounce）后调用 `GET /api/topics?search={keyword}`
- **AND** 列表 **SHALL** 仅显示匹配的 Topic

#### Scenario: Clear search

- **WHEN** 用户清空搜索框
- **THEN** 系统 **SHALL** 恢复显示完整的 Topic 列表

### Requirement: Topic Sort

系统 **MUST** 提供会话列表排序切换。

#### Scenario: Sort options

- **WHEN** 用户点击排序切换按钮
- **THEN** 系统 **SHALL** 提供三种排序方式：最近活跃（updatedAt desc）、创建时间（createdAt desc）、标题字母序（title asc）
- **AND** 当前选中的排序方式 **SHALL** 高亮显示

### Requirement: Topic Pin Toggle

系统 **MUST** 支持在会话列表中切换 Topic 的置顶状态。

#### Scenario: Pin topic from context menu

- **WHEN** 用户对未置顶的 Topic 选择"置顶"
- **THEN** 系统 **SHALL** 调用 `PATCH /api/topics/{id}` 设置 `pinned: true`
- **AND** 该 Topic **SHALL** 移动到列表顶部
- **AND** 该 Topic **SHALL** 显示置顶标记图标

#### Scenario: Unpin topic

- **WHEN** 用户对已置顶的 Topic 选择"取消置顶"
- **THEN** 系统 **SHALL** 调用 `PATCH /api/topics/{id}` 设置 `pinned: false`
- **AND** 该 Topic **SHALL** 回到正常排序位置

### Requirement: Topic Archive UI

系统 **MUST** 支持在会话列表中归档和恢复 Topic。

#### Scenario: Archive topic from context menu

- **WHEN** 用户对活跃 Topic 选择"归档"
- **THEN** 系统 **SHALL** 调用 `PATCH /api/topics/{id}` 设置 `archivedAt` 为当前时间
- **AND** 该 Topic **SHALL** 从活跃列表中消失

#### Scenario: View archived topics

- **WHEN** 用户点击"查看归档"按钮
- **THEN** 系统 **SHALL** 切换到归档视图，调用 `GET /api/topics?archived=true`
- **AND** 列表 **SHALL** 仅显示已归档的 Topic

#### Scenario: Unarchive topic

- **WHEN** 用户在归档视图中对某 Topic 选择"恢复"
- **THEN** 系统 **SHALL** 调用 `PATCH /api/topics/{id}` 设置 `archivedAt: null`
- **AND** 该 Topic **SHALL** 从归档列表消失，重新出现在活跃列表

### Requirement: Conversations Page Layout Update

系统 **MUST** 更新会话列表页面布局以容纳搜索和排序控件。

#### Scenario: Updated conversations page

- **WHEN** 用户打开会话列表页面
- **THEN** 页面 **SHALL** 包含搜索框、排序切换、归档视图切换
- **AND** Topic 列表 **SHALL** 显示每个 Topic 的标题、关联 Assistant 名称、最后更新时间
- **AND** 置顶的 Topic **SHALL** 显示置顶图标并排在列表最前

