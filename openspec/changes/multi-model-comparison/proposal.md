# Change: multi-model-comparison

## Why

用户经常需要对比不同模型的回复质量（如 GPT-4o vs Claude Sonnet vs DeepSeek），当前流程是：创建多个 Assistant -> 分别提问同一问题 -> 来回切换对比。这个工作流非常繁琐。

模型对比是高级用户的刚需，也是区别于 ChatGPT 单模型体验的差异化功能。

## What Changes

- **对比模式入口**: 在 MessageInput 旁增加"对比"按钮，或在 Assistant 选择时支持多选
- **一问多答**: 发送一条消息后同时向多个模型发起请求，并排展示各模型回复
- **对比视图**: 水平或垂直分栏显示不同模型的回复，高亮差异部分（可选）
- **结果评价**: 用户可为每个回复点赞/踩，数据保存用于个人偏好统计
- **对话中途换模型**: 在现有对话中临时切换模型继续，新回复标注使用的模型
- **模型能力标签**: 在 Provider 配置中为模型添加能力标签（擅长代码/擅长写作/支持视觉），辅助选择
- **费用对比**: 在对比视图中展示各模型的 token 消耗和估算费用

## Impact

**受影响的 specs**:
- **chat-core** (修改): Message.metadata 需记录实际使用的 model 信息
- **chat-ui-components** (修改): 新增对比视图布局
- **settings-core** (修改): 模型能力标签配置

**受影响的代码**:
- `src/app/api/chat/compare/route.ts` - 新增对比请求 API
- `src/components/chat/CompareView.tsx` - 新增对比视图组件
- `src/components/chat/ModelSelector.tsx` - 新增多模型选择器
- `src/components/chat/ChatContainer.tsx` - 集成对比模式
- `src/app/(main)/chat/[topicId]/page.tsx` - 对比模式路由参数

**依赖关系**:
- 依赖 `polish-chat-experience` 中的 Token 用量显示
- 需要多个 Provider 已配置

**预计工作量**: ~4-5 天
