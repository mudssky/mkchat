## Context

当前 Topic 管理能力非常有限：

- **无删除**：没有 DELETE handler，不可删除历史会话
- **无搜索/排序**：会话列表没有搜索框，也没有排序选项
- **无置顶/归档**：Topic 模型不包含 `pinned`、`archivedAt` 字段
- **重命名已有**：PATCH `/api/topics/[id]` 已支持更新 `title`，但前端没有内联编辑入口
- **列表来源间接**：Topic 列表嵌套在 `GET /api/assistants` 的响应中，没有独立的 `GET /api/topics` 端点

现有 Topic 模型字段：`id`, `assistantId`, `title?`, `createdAt`, `updatedAt`。

## Goals / Non-Goals

**Goals:**

- 提供完整的 Topic CRUD（增/查/改/删）
- 新增独立 `GET /api/topics` 端点，支持搜索、排序、分页、过滤（置顶 / 归档）
- Topic 模型扩展：`pinned: Boolean`、`archivedAt: DateTime?`
- 前端会话列表增加搜索框、排序切换、右键菜单（删除 / 重命名 / 置顶 / 归档）
- 删除 Topic 时级联删除关联 Message

**Non-Goals:**

- 批量操作（多选删除/归档）——后续迭代
- 文件夹/标签分组——后续迭代
- 跨 Assistant 的 Topic 移动
- 消息内容全文搜索（仅按 title 搜索）

## Decisions

### 1. 新增独立 GET /api/topics 端点 vs 继续嵌套在 assistants 中

**选择：新增独立端点 `GET /api/topics`**

理由：
- 嵌套方式无法支持跨 Assistant 搜索/排序/分页
- 独立端点遵循 RESTful 约定，更利于前端状态管理
- 原有 `GET /api/assistants` 的嵌套 topics 保留不变，避免影响现有逻辑

查询参数：
- `search?: string` — 按 title 模糊匹配（`contains`, case-insensitive）
- `sort?: 'updatedAt' | 'createdAt' | 'title'` — 排序字段，默认 `updatedAt`
- `order?: 'asc' | 'desc'` — 排序方向，默认 `desc`
- `archived?: boolean` — 是否查看归档列表，默认 `false`
- `assistantId?: string` — 按 Assistant 过滤

返回时自动将 `pinned: true` 的 Topic 置顶（不受排序参数影响）。

### 2. 删除策略：硬删除 vs 软删除

**选择：硬删除 + 确认弹窗**

理由：
- 已有归档机制（`archivedAt`）作为"后悔药"，不需要额外的软删除层
- 硬删除减少数据膨胀，SQLite 对大表查询性能敏感
- Prisma `onDelete: Cascade` 自动级联删除 Message，无需手动处理

### 3. 归档实现方案

**选择：`archivedAt: DateTime?` 字段**

- `null` = 活跃状态，非 `null` = 归档时间
- `GET /api/topics` 默认 `where: { archivedAt: null }`
- 传 `?archived=true` 时查询 `where: { archivedAt: { not: null } }`
- 恢复归档：`PATCH /api/topics/[id]` 设置 `archivedAt: null`

替代方案：`status: enum('active', 'archived')` — 弃选，因为 `archivedAt` 同时记录了归档时间点，信息更丰富。

### 4. 前端交互：右键菜单 vs 操作按钮

**选择：hover 显示操作图标 + 右键菜单双入口**

- 每个 Topic 行右侧 hover 时显示 `⋮` 更多按钮
- 点击或右键弹出菜单：重命名 / 置顶 / 归档 / 删除
- 重命名使用内联编辑（点击标题切换为 input，Enter 确认，Esc 取消）
- 删除弹出 Ant Design `Modal.confirm` 二次确认

### 5. 内联重命名 vs 弹窗编辑

**选择：内联编辑**

理由：
- 交互更轻量，符合 Cherry Studio、ChatGPT 等产品的体验
- 已有 `PATCH /api/topics/[id]` 支持更新 title，无需新增 API

### 6. 数据库迁移

新增两个字段到 `Topic` 模型：

```prisma
model Topic {
  // ...existing fields
  pinned     Boolean   @default(false)
  archivedAt DateTime?
}
```

使用 `pnpm prisma:migrate-dev` 生成迁移文件。现有数据默认 `pinned = false`, `archivedAt = null`，无需数据迁移脚本。

## Risks / Trade-offs

- **级联删除不可恢复** → 删除前使用 `Modal.confirm` 二次确认，明确告知用户"所有消息将被永久删除"
- **搜索性能**：SQLite `LIKE` 查询在大量 Topic 时性能可能下降 → 当前用户规模为单用户本地使用，不构成瓶颈；后续可考虑 FTS5 扩展
- **嵌套 topics 与独立端点共存**：`GET /api/assistants` 仍返回嵌套 topics → 保持向后兼容，但 conversations 页面迁移到使用新端点
