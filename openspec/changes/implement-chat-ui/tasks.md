# Tasks: implement-chat-ui

本文档定义了实现聊天 UI 的具体任务列表，按照依赖关系排序，确保每个任务都能交付可验证的用户价值。

## 阶段 1: 基础设施和数据层 (并行)

### Task 1.1: 创建聊天页面路由
**估时**: 0.5h  
**依赖**: 无  
**交付物**:
- [x] 创建 `src/app/(main)/chat/[topicId]/page.tsx`
- [x] 实现基础页面布局（Header + Content + Input 区域）
- [x] 添加路由参数验证
- [x] 配置页面 metadata

**验证**:
- 访问 `/chat/test-id` 显示页面骨架
- 无效的 topicId 显示 404 页面

---

### Task 1.2: 实现 Topic API 端点
**估时**: 1h  
**依赖**: 无  
**交付物**:
- [x] 创建 `src/app/api/topics/[id]/route.ts`
- [x] 实现 GET handler 获取 Topic 和关联的 Messages
- [x] 添加错误处理（Topic 不存在、数据库错误）
- [x] 编写单元测试

**验证**:
- `GET /api/topics/{id}` 返回正确的 JSON 结构
- 不存在的 ID 返回 404
- 测试覆盖率 > 80%

---

### Task 1.3: 设置 TanStack Query
**估时**: 0.5h  
**依赖**: 无  
**交付物**:
- [x] 配置 QueryClientProvider
- [x] 创建 `src/lib/query-client.ts`
- [x] 定义默认 query 选项（staleTime, cacheTime）
- [x] 添加 devtools（开发环境）

**验证**:
- React Query Devtools 在开发环境可见
- 默认配置生效

---

## 阶段 2: 核心 UI 组件 (顺序)

### Task 2.1: 实现 MessageBubble 组件
**估时**: 2h  
**依赖**: Task 1.3  
**交付物**:
- [x] 创建 `src/components/chat/MessageBubble.tsx`
- [x] 集成 Ant Design X Bubble 组件
- [x] 实现用户/AI 消息样式差异
- [x] 添加 Markdown 渲染支持（react-markdown）
- [x] 实现代码块语法高亮（prism-react-renderer）
- [x] 添加复制按钮到代码块
- [x] 编写组件测试

**验证**:
- 用户消息右对齐，蓝色背景
- AI 消息左对齐，灰色背景
- Markdown 正确渲染（粗体、列表、链接）
- 代码块有语法高亮和复制功能
- 组件测试通过

---

### Task 2.2: 实现消息树遍历逻辑
**估时**: 1.5h  
**依赖**: Task 1.2  
**交付物**:
- [x] 创建 `src/lib/chat/message-tree.ts`
- [x] 实现 `buildMessageChain(messages, leafId)` 函数
- [x] 实现 `findSiblings(messages, messageId)` 函数
- [x] 实现 `getDefaultLeaf(messages)` 函数
- [x] 编写单元测试（覆盖各种树结构）

**验证**:
- 从叶子节点正确遍历到根节点
- 正确识别兄弟节点
- 处理空树和单节点情况
- 测试覆盖率 100%

---

### Task 2.3: 实现 MessageList 组件
**估时**: 2.5h  
**依赖**: Task 2.1, Task 2.2  
**交付物**:
- [x] 创建 `src/components/chat/MessageList.tsx`
- [x] 使用 message-tree 逻辑构建当前分支
- [x] 渲染 MessageBubble 列表
- [x] 实现自动滚动到底部
- [x] 添加空状态提示
- [x] 实现分支指示器 UI
- [x] 编写组件测试

**验证**:
- 消息按正确顺序显示
- 新消息到达时自动滚动
- 空对话显示欢迎提示
- 有多个子节点的消息显示分支指示器
- 组件测试通过

---

### Task 2.4: 实现 MessageInput 组件
**估时**: 2h  
**依赖**: Task 1.3  
**交付物**:
- [x] 创建 `src/components/chat/MessageInput.tsx`
- [x] 集成 Ant Design X Sender 组件
- [x] 实现多行输入和自动高度调整
- [x] 添加 Ctrl+Enter 发送快捷键
- [x] 实现输入验证（非空检查）
- [x] 添加发送状态指示
- [x] 编写组件测试

**验证**:
- Enter 换行，Ctrl+Enter 发送
- 空内容无法发送
- 发送时按钮禁用
- 发送后输入框清空
- 组件测试通过

---

## 阶段 3: 状态管理 (顺序)

### Task 3.1: 创建 Chat Zustand Store
**估时**: 1h  
**依赖**: 无  
**交付物**:
- [x] 创建 `src/store/chat-store.ts`
- [x] 定义状态接口（currentBranchPath, inputDraft, isComposing）
- [x] 实现 actions（setCurrentBranch, updateDraft）
- [x] 添加 persist 中间件（保存草稿）
- [x] 编写单元测试

**验证**:
- 状态更新正确触发重渲染
- 草稿持久化到 localStorage
- 测试覆盖所有 actions

---

### Task 3.2: 实现分支导航逻辑
**估时**: 2h  
**依赖**: Task 2.2, Task 3.1  
**交付物**:
- [x] 创建 `src/components/chat/BranchNavigator.tsx`
- [x] 实现分支选择下拉菜单
- [x] 显示每个分支的预览文本
- [x] 高亮当前分支
- [x] 集成 chat-store 更新分支路径
- [x] 编写组件测试

**验证**:
- 点击分支按钮显示选择器
- 选择分支后消息列表更新
- 当前分支正确高亮
- 组件测试通过

---

### Task 3.3: 集成 ChatContainer
**估时**: 1.5h  
**依赖**: Task 2.3, Task 2.4, Task 3.1  
**交付物**:
- [x] 创建 `src/components/chat/ChatContainer.tsx`
- [x] 使用 TanStack Query 获取 Topic 数据
- [x] 连接 MessageList 和 MessageInput
- [x] 实现消息发送处理
- [x] 添加加载和错误状态
- [x] 编写集成测试

**验证**:
- 页面加载时显示 loading 状态
- 数据加载后显示消息列表
- 发送消息触发正确的 API 调用
- 错误时显示友好提示

---

## 阶段 4: 流式响应 (顺序)

### Task 4.1: 创建 Chat API 端点
**估时**: 2h  
**依赖**: Task 1.2  
**交付物**:
- [x] 创建 `src/app/api/chat/route.ts`
- [x] 实现 POST handler
- [x] 保存用户消息到数据库
- [x] 集成 Vercel AI SDK streamText
- [x] 配置 Provider（基于 ProviderConfig）
- [x] 实现 SSE 响应流
- [x] 编写 API 测试

**验证**:
- POST /api/chat 返回 SSE 流
- 用户消息正确保存
- AI 响应流式返回
- 错误情况正确处理

---

### Task 4.2: 集成 useChat Hook
**估时**: 2h  
**依赖**: Task 4.1, Task 3.3  
**交付物**:
- [x] 在 ChatContainer 中使用 `useChat` hook
- [x] 配置 API 端点和请求参数
- [x] 实现乐观更新
- [x] 处理流式响应状态（loading, streaming, error）
- [x] 实现响应完成后的数据刷新
- [x] 编写集成测试

**验证**:
- 发送消息后立即显示在 UI
- AI 响应实时流式显示
- 流完成后数据持久化
- 错误时正确回滚

---

### Task 4.3: 实现流式错误处理
**估时**: 1.5h  
**依赖**: Task 4.2  
**交付物**:
- [x] 添加网络错误检测
- [x] 实现超时处理（30s）
- [x] 保存部分响应逻辑
- [x] 添加重试按钮
- [x] 实现"停止生成"功能
- [ ] 编写错误场景测试

**验证**:
- 网络中断时保存部分内容
- 超时后显示错误提示
- 重试功能正常工作
- 停止生成正确中止流

---

### Task 4.4: 优化流式性能
**估时**: 1h  
**依赖**: Task 4.2  
**交付物**:
- [x] 实现 token 批量处理（50ms 间隔）
- [x] 添加 Markdown 渲染防抖
- [x] 优化滚动性能（使用 requestAnimationFrame）
- [ ] 添加性能监控（可选）
- [ ] 编写性能测试

**验证**:
- 快速流式响应时 UI 流畅
- CPU 使用率合理
- 无明显卡顿

---

## 阶段 5: 高级功能 (并行)

### Task 5.1: 实现消息编辑
**估时**: 2h  
**依赖**: Task 3.3, Task 4.2  
**交付物**:
- [x] 在 MessageBubble 添加编辑按钮
- [x] 实现编辑模式 UI
- [x] 创建新分支逻辑
- [x] 保存编辑后的消息
- [x] 触发新的 AI 响应
- [ ] 编写功能测试

**验证**:
- 点击编辑显示输入框
- 提交编辑创建新分支
- 新分支正确关联父消息
- AI 基于新消息生成响应

---

### Task 5.2: 实现响应式布局
**估时**: 1.5h  
**依赖**: Task 3.3  
**交付物**:
- [x] 添加桌面端样式（≥768px）
- [x] 添加移动端样式（<768px）
- [ ] 优化触摸交互
- [x] 测试不同屏幕尺寸
- [x] 编写响应式测试

**验证**:
- 桌面端消息居中，最大宽度 800px
- 移动端消息全宽显示
- 触摸操作流畅

---

### Task 5.3: 实现键盘导航
**估时**: 1h  
**依赖**: Task 3.3  
**交付物**:
- [ ] 配置 Tab 键焦点顺序
- [x] 添加焦点样式
- [x] 实现快捷键（Ctrl+Enter）
- [x] 添加 ARIA 标签
- [ ] 测试屏幕阅读器兼容性

**验证**:
- Tab 键正确导航
- 焦点指示器清晰
- 快捷键正常工作
- 屏幕阅读器可用

---

## 阶段 6: 测试和优化 (顺序)

### Task 6.1: 端到端测试
**估时**: 2h  
**依赖**: 所有功能任务完成  
**交付物**:
- [ ] 编写完整聊天流程 E2E 测试
- [x] 测试分支导航流程
- [ ] 测试错误恢复流程
- [x] 测试响应式布局
- [ ] 生成测试报告

**验证**:
- 所有 E2E 测试通过
- 测试覆盖核心用户场景

---

### Task 6.2: 性能优化和审计
**估时**: 1.5h  
**依赖**: Task 6.1  
**交付物**:
- [ ] 运行 Lighthouse 审计
- [ ] 优化首屏加载时间
- [ ] 减少 bundle 大小（代码分割）
- [ ] 优化图片和资源
- [ ] 生成性能报告

**验证**:
- Lighthouse 性能评分 > 90
- 首屏加载 < 2s
- Bundle 大小合理

---

### Task 6.3: 文档和示例
**估时**: 1h  
**依赖**: Task 6.2  
**交付物**:
- [ ] 编写组件使用文档
- [ ] 添加代码注释
- [ ] 创建 Storybook 示例（可选）
- [ ] 更新 README
- [ ] 录制演示视频

**验证**:
- 文档清晰完整
- 示例可运行

---

## 总结

**总估时**: ~28.5 小时（约 4-5 个工作日）

**关键里程碑**:
1. ✅ 阶段 1 完成：基础设施就绪
2. ✅ 阶段 2 完成：核心 UI 可见
3. ✅ 阶段 3 完成：交互功能完整
4. 🟡 阶段 4 进行中：流式响应工作（缺少错误场景/性能测试）
5. 🟡 阶段 5 进行中：高级功能可用（缺少编辑/无障碍测试）
6. ⬜ 阶段 6 未完成：生产就绪（E2E/性能/文档未齐）

**并行机会**:
- 阶段 1 的三个任务可并行
- 阶段 5 的三个任务可并行
- Task 2.1 和 Task 2.2 可并行

**风险缓解**:
- 每个任务都有明确的验证标准
- 测试先行，确保质量
- 增量交付，持续验证
