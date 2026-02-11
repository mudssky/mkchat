## 1. API 层扩展

- [x] 1.1 扩展 `POST /api/chat` 的 Zod schema，添加可选字段 `compareParentId: string?` 和 `compareGroupId: string?`、`compareModelId: string?`、`compareProviderName: string?`
- [x] 1.2 修改 `POST /api/chat` route handler：当请求包含 `compareParentId` 时，跳过用户消息创建，直接使用 `compareParentId` 作为 AI 回复的 `parentId`
- [x] 1.3 修改 `POST /api/chat` route handler：对比模式下使用请求中的 `assistantId` 解析对应的 ProviderConfig 和 modelId（而非 Topic 绑定的 Assistant）
- [x] 1.4 修改 `onFinish` 回调：将 `compareGroupId`、`compareModelId`、`compareProviderName` 写入 assistant 消息的 `metadata`
- [x] 1.5 新增 `PATCH /api/messages/[id]` 端点，支持更新消息的 `metadata`（用于投票）
- [ ] 1.6 为以上 API 变更编写单元测试

## 2. 数据层

- [x] 2.1 扩展 `ChatMessageMetadata` 类型定义，添加 `compareGroupId`、`compareModelId`、`compareProviderName`、`vote` 字段
- [x] 2.2 在 `message-tree.ts` 中添加 `findCompareGroup(messages, compareGroupId)` 工具函数，返回同一对比组的所有消息
- [x] 2.3 在 `message-tree.ts` 中添加 `isCompareGroup(messages, parentId)` 工具函数，判断某个父节点下的子节点是否构成对比组
- [x] 2.4 为消息树新增函数编写单元测试

## 3. 对比流管理 Hook

- [ ] 3.1 创建 `src/hooks/use-compare-chat.ts`，实现 `useCompareChat` hook 核心逻辑：接受消息文本和模型列表，返回各流状态
- [ ] 3.2 实现并行请求逻辑：第一个请求正常发送（创建用户消息），后续请求携带 `compareParentId`
- [ ] 3.3 实现 SSE 流解析：使用 `fetch` + `ReadableStream` 解析 AI SDK Data Stream Protocol，独立管理每个流的内容和状态
- [ ] 3.4 实现全局状态管理：跟踪所有流的完成状态，全部完成后触发 TanStack Query 刷新
- [ ] 3.5 实现取消功能：提供 `stopAll()` 方法中止所有进行中的流
- [ ] 3.6 为 `useCompareChat` 编写单元测试

## 4. 模型选择器组件

- [ ] 4.1 创建 `src/components/chat/ModelPicker.tsx`：弹出面板，列出所有已配置 Provider 下的可用模型，按 Provider 分组
- [ ] 4.2 实现多选逻辑：支持选择 2-4 个模型，显示已选标签，支持单独移除
- [ ] 4.3 实现无模型提示：未配置 Provider 时显示引导信息
- [x] 4.4 扩展 Zustand `chat-store`：添加 `compareModels` 状态，存储用户选择的对比模型列表
- [ ] 4.5 为 ModelPicker 编写组件测试

## 5. 对比视图组件

- [ ] 5.1 创建 `src/components/chat/CompareView.tsx`：并排展示同一 `compareGroupId` 下的所有 assistant 回复
- [ ] 5.2 实现每列的流式渲染：显示模型名称标签、流式状态指示器、Markdown 内容
- [ ] 5.3 实现投票交互：每列底部显示「👍」「👎」按钮，点击后调用 `PATCH /api/messages/[id]`
- [ ] 5.4 实现「继续对话」按钮：点击后切换到该分支，退出对比视图
- [ ] 5.5 实现响应式布局：桌面端水平并排，移动端垂直堆叠
- [ ] 5.6 为 CompareView 编写组件测试

## 6. 集成到 ChatContainer

- [ ] 6.1 修改 `MessageInput`：在发送按钮旁添加「对比」按钮，点击弹出 ModelPicker
- [ ] 6.2 修改 `MessageInput`：当有已选对比模型时，发送按钮触发对比发送流程（调用 `useCompareChat`）
- [ ] 6.3 修改 `ChatContainer`：集成 `useCompareChat` hook，管理对比模式状态
- [ ] 6.4 修改 `MessageList`：检测对比组，在最后一组消息处渲染 CompareView 替代 MessageBubble
- [ ] 6.5 修改 `ChatContainer`：对比进行中显示「停止全部」按钮，替代普通的「停止生成」
- [ ] 6.6 对集成后的完整对比流程进行冒烟测试

## 7. 辅助功能 & 收尾

- [ ] 7.1 获取 Assistant 列表 API：确保 `GET /api/assistants` 返回每个 Assistant 的 `modelId` 和 `providerConfig.name`，供 ModelPicker 使用
- [ ] 7.2 对比模式下的 TopBar 更新：显示"对比模式"状态标识
- [ ] 7.3 确保普通模式不受影响：无 `compareParentId` 时 API 行为与现有完全一致
- [ ] 7.4 运行 `pnpm qa` 全量质检通过
