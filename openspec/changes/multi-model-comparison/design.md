## Context

mkchat 当前架构中，一个 Topic 绑定一个 Assistant（含 ProviderConfig + modelId），消息通过 `parentId` 自引用形成树形结构。`POST /api/chat` 每次接受一个 `assistantId`，创建一个流式响应。前端 `useChat` hook 管理单个流。

用户需要对比不同模型的回复质量时，需手动创建多个 Assistant、分别提问同一问题、来回切换对比，流程繁琐。

**核心约束**：
- 消息树结构已支持分支（同一 parentId 下多个子节点 = 兄弟分支）
- BranchNavigator 已支持分支切换
- `streamText` 和 `useChat` 均基于单流设计
- Topic 与 Assistant 一对一绑定

## Goals / Non-Goals

**Goals:**
- 同一条用户消息同时发送给多个模型（2-4 个），并排展示各模型的流式回复
- 复用现有消息树结构，多模型回复作为同一 parentId 下的兄弟节点存储
- 对比模式与普通模式可自由切换，不影响已有对话功能
- 支持对各模型回复进行简单评价（点赞/踩）

**Non-Goals:**
- 不实现模型能力标签和推荐系统（后续迭代）
- 不实现费用估算和 token 对比（依赖 `polish-chat-experience` 中的 Token 用量显示）
- 不实现对比结果的统计报表
- 不修改 Prisma schema（仅利用现有 `metadata` JSON 字段扩展）
- 不实现对比会话的独立路由（在现有 chat 页面内切换模式）

## Decisions

### D1: 前端并行调用 vs 后端多模型路由

**决策**: 前端并行调用现有 `/api/chat` API（每个模型一次请求）。

**理由**:
- 现有 `/api/chat` 已处理完整的消息持久化、MCP 工具发现、流式生成，复用成本最低
- 每个请求独立创建 assistant 回复，天然形成兄弟分支节点
- 各流独立失败/重试，不会互相影响
- 避免后端引入复杂的多流协调逻辑

**替代方案**: 新建 `POST /api/chat/compare` 端点统一处理 → 增加后端复杂度，且 `streamText` 不支持原生多流合并

### D2: 对比模式的 assistantId 解析

**决策**: 引入 `assistantId 覆盖` 机制 — 对比请求中显式传入目标 `assistantId`，API 使用请求中的 `assistantId` 而非 Topic 绑定的 Assistant。

**理由**:
- 当前 `/api/chat` 已接受 `assistantId` 参数，只需确保它使用请求传入的值（而非 Topic 上的）
- 不需要修改 Topic-Assistant 关系
- 对比模式下的用户消息只创建一次（第一个请求），后续请求通过 `parentId` 指向同一条用户消息

**实现细节**: 对比请求流程：
1. 第一个请求正常发送（创建用户消息 + 生成 AI 回复）
2. 后续 N-1 个请求携带 `compareParentId`（第一个请求创建的用户消息 ID），跳过用户消息创建，直接生成 AI 回复

### D3: 数据模型扩展方式

**决策**: 通过 Message 的 `metadata` JSON 字段记录对比相关信息，不修改 Prisma schema。

**理由**:
- `metadata` 字段已存在且类型为 `Json?`，灵活可扩展
- 避免数据库迁移，降低变更风险
- 对比信息属于辅助元数据，不需要 SQL 级查询

**metadata 扩展字段**:
```typescript
interface CompareMetadata {
  compareGroupId?: string    // 同一轮对比的唯一标识（UUID）
  compareModelId?: string    // 实际使用的 modelId
  compareProviderName?: string  // Provider 名称
  vote?: 'up' | 'down'      // 用户评价
}
```

### D4: UI 布局方案

**决策**: 在 MessageList 下方叠加 CompareView 组件，检测到对比分支时自动切换为并排视图。

**理由**:
- 复用 MessageList 渲染上文消息链（到用户消息为止）
- 仅对最后一组对比回复使用并排布局
- 用户可通过 BranchNavigator 切换回单一分支查看

**布局结构**:
```
┌──────────────────────────────────────┐
│  MessageList（上文消息链）             │
│  ...                                 │
│  [用户消息]                           │
├──────────────────────────────────────┤
│  CompareView（并排对比区域）           │
│  ┌─────────┬─────────┬─────────┐    │
│  │ Model A  │ Model B  │ Model C │    │
│  │ 流式回复  │ 流式回复  │ 流式回复 │    │
│  │          │          │          │    │
│  │ 👍 👎   │ 👍 👎   │ 👍 👎   │    │
│  └─────────┴─────────┴─────────┘    │
├──────────────────────────────────────┤
│  MessageInput                        │
└──────────────────────────────────────┘
```

### D5: 多流管理方案

**决策**: 使用多个独立的 `fetch` 调用（不依赖 `useChat` hook），手动解析 SSE 流并管理状态。

**理由**:
- `useChat` 假设单流、管理整个消息列表，不适合并行多流场景
- 对比模式只需要流式读取 AI 回复内容，不需要 `useChat` 的消息列表管理
- 直接使用 `fetch` + `ReadableStream` 解析 AI SDK 的 Data Stream Protocol
- 使用 `useCompareChat` 自定义 hook 封装并行流逻辑

### D6: 对比模式入口

**决策**: 在 MessageInput 组件旁添加「对比」按钮，点击后弹出模型选择器（ModelPicker），选择 2-4 个模型后发送。

**理由**:
- 与现有发送流程并行，不干扰普通模式
- 模型选择器从已配置的 Provider 中列出所有可用模型
- 选择后临时存入 Zustand store，发送时读取

## Risks / Trade-offs

**[并发流性能]** → 同时发起 2-4 个流式请求可能导致浏览器 HTTP 连接池压力。Mitigation: 限制最大对比模型数为 4；各流独立超时处理。

**[用户消息重复创建]** → 并行请求可能导致用户消息被创建多次。Mitigation: 只有第一个请求创建用户消息，后续请求使用 `compareParentId` 跳过创建。需要在 API 中增加此逻辑。

**[Token 上下文一致性]** → 不同模型的上下文窗口大小不同，相同 trace 可能在某些模型上超限。Mitigation: 使用 AI SDK 的 `maxTokens` 配置，各模型独立处理截断。

**[对比消息的后续对话]** → 用户在对比后选择某个回复继续对话时，需要明确切换到对应的分支。Mitigation: 用户点击某个对比回复的「继续对话」按钮后，通过 BranchNavigator 切换到该分支，恢复普通模式。

**[现有 API 兼容性]** → 在 `/api/chat` 中增加 `compareParentId` 参数需要保持向后兼容。Mitigation: `compareParentId` 为可选参数，不传时行为与现有完全一致。
