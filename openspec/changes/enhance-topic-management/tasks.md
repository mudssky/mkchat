# Tasks: enhance-topic-management

## 1. 数据模型扩展

- [x] 1.1 在 `prisma/schema/chat.prisma` 的 `Topic` 模型中新增 `pinned Boolean @default(false)` 和 `archivedAt DateTime?` 字段
- [x] 1.2 确保 `Message` 关联的 `onDelete: Cascade` 配置正确（删除 Topic 时级联删除 Message）
- [x] 1.3 运行 `pnpm prisma:migrate-dev` 生成迁移文件，验证迁移成功
- [x] 1.4 运行 `pnpm prisma:generate` 更新 Prisma 客户端类型
- [x] 1.5 更新 `src/types/chat.ts` 中的 `ChatTopic` 和 `AssistantTopicSummary` 接口，新增 `pinned` 和 `archivedAt` 字段

## 2. Topic List API (GET /api/topics)

- [x] 2.1 在 `src/app/api/topics/route.ts` 新增 `GET` handler，使用 Zod 校验查询参数 `search?`, `sort?`, `order?`, `archived?`, `assistantId?`
- [x] 2.2 实现查询逻辑：默认返回 `archivedAt = null` 的 Topic，置顶 Topic 始终排在最前，支持 `title` 模糊搜索（`contains`, mode: `insensitive`）
- [x] 2.3 响应中包含关联的 `assistant.name` 和 `assistant.modelId`（使用 Prisma `include`）
- [x] 2.4 编写 GET handler 单元测试：默认排序 / 搜索 / 归档过滤 / 按 Assistant 过滤 / 排序切换

## 3. Topic Delete API (DELETE /api/topics/[id])

- [x] 3.1 在 `src/app/api/topics/[id]/route.ts` 新增 `DELETE` handler，校验 Topic 存在后执行 `prisma.topic.delete`（级联删除 Message）
- [x] 3.2 编写 DELETE handler 单元测试：成功删除返回 200 / Topic 不存在返回 404 / 无效 ID 返回 404

## 4. 扩展 PATCH API

- [x] 4.1 扩展 `src/app/api/topics/[id]/route.ts` 的 PATCH handler Zod schema，新增可选字段 `pinned?: boolean` 和 `archivedAt?: string | null`
- [x] 4.2 实现 `archivedAt` 传 `null` 时重置为 `null`（取消归档），传日期字符串时设置归档时间
- [x] 4.3 编写扩展 PATCH 的单元测试：置顶/取消置顶 / 归档/取消归档

## 5. 前端会话列表重构

- [x] 5.1 创建 `src/hooks/use-topics.ts`，封装 `GET /api/topics` 的 TanStack Query hook，支持 search/sort/archived 参数
- [x] 5.2 创建 `src/components/chat/TopicListItem.tsx`，展示单个 Topic 行（标题、Assistant 名、时间、置顶图标），支持 hover 显示 `⋮` 更多按钮
- [x] 5.3 创建 `src/components/chat/TopicContextMenu.tsx`，使用 Ant Design Dropdown 实现右键/点击菜单（重命名 / 置顶 / 归档 / 删除）
- [x] 5.4 实现内联重命名：点击"重命名"切换为 input 元素，Enter 确认调用 PATCH，Esc 取消恢复原文
- [x] 5.5 实现删除确认：使用 `Modal.confirm` 弹窗，提示"删除后所有消息将被永久删除，不可恢复"

## 6. 搜索、排序与归档视图

- [x] 6.1 在 `src/app/(main)/conversations/page.tsx` 顶部添加搜索框（Input.Search），带 300ms debounce
- [x] 6.2 添加排序切换按钮（Segmented 或 Dropdown）：最近活跃 / 创建时间 / 标题字母序
- [x] 6.3 添加"查看归档"切换按钮，切换 `archived` 参数；归档视图中的右键菜单显示"恢复"替代"归档"
- [x] 6.4 重构 `ChatEntry.tsx` 或替换为新的 `TopicList.tsx`，使用 `use-topics` hook 替代从 assistants 嵌套获取 topics

## 7. 验证

- [x] 7.1 运行 `pnpm qa` 确保 typecheck + lint + test 全部通过
- [ ] 7.2 手动验证全流程：新建对话 → 重命名 → 置顶 → 搜索 → 归档 → 查看归档 → 恢复 → 删除
