# Change: enhance-topic-management

## Why

当前会话管理仅支持"新建对话"和"从列表进入历史对话"两项基本操作。用户无法删除无用会话、重命名对话、对会话进行搜索过滤或归档整理。随着对话数量增长，列表会变得混乱不可管理，严重影响日常使用体验。

Cherry Studio 等成熟产品都提供了完整的会话管理能力，这是 AI 工作台的基础体验。

## What Changes

- **会话删除**: 支持单条删除和批量删除，删除前需二次确认，关联的 Message 一并级联删除
- **会话重命名**: 点击标题即可内联编辑，支持 Enter 确认 / Esc 取消
- **会话搜索**: 在会话列表顶部提供搜索框，支持按标题和消息内容模糊搜索
- **会话置顶**: 支持置顶/取消置顶，置顶会话始终排在列表最前
- **会话归档**: 支持归档会话（软删除），归档后从主列表隐藏，可在归档列表中恢复
- **列表排序**: 默认按最近活跃排序，支持按创建时间、标题字母序切换

## Impact

**受影响的 specs**:
- **settings-core** (修改): Topic 列表交互增强
- **chat-core** (修改): 新增删除/归档的级联逻辑
- **data-modeling** (修改): Topic 表新增 `pinned`, `archivedAt` 字段

**受影响的代码**:
- `prisma/schema/chat.prisma` - Topic 模型增加字段
- `src/app/api/topics/[id]/route.ts` - 增加 PATCH/DELETE handler
- `src/app/api/topics/route.ts` - 增加搜索和排序参数
- `src/components/chat/ChatEntry.tsx` - 重构为完整会话管理列表
- `src/app/(main)/conversations/page.tsx` - 增加搜索/过滤/排序 UI

**预计工作量**: ~2-3 天
