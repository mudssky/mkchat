# Change: mcp-tool-ui

## Why

MCP 是 mkchat 相比普通聊天应用的核心差异点。后端已实现 MCP SSE Client 的工具发现和执行能力（`mcp-service.ts`），`chat/route.ts` 中也已将 MCP 工具注册到 `streamText`，但前端完全没有展示工具调用过程——用户看不到 LLM 调用了什么工具、传了什么参数、返回了什么结果。

Cherry Studio 的 MCP 体验是其杀手特性之一。没有可视化的工具调用，用户就像在和一个"黑盒"对话。

## What Changes

- **Tool Call 消息渲染**: 在 MessageBubble 中识别 `tool-invocation` part，渲染为可折叠的工具调用卡片，展示工具名、参数（JSON 语法高亮）、执行状态（loading/success/error）、返回结果
- **工具执行状态指示**: 流式过程中实时显示"正在调用 xxx 工具…"的中间状态，参数逐步展开
- **MCP 连接状态**: 在聊天页面 TopBar 或侧栏展示当前 Assistant 绑定的 MCP 服务器连接状态（在线/离线/错误），点击可跳转到 MCP 设置
- **工具审批机制（可选）**: 高危工具（如写入操作）可配置为需要用户手动确认后才执行
- **Tool Result 格式化**: 根据返回内容类型智能渲染——JSON 树形展示、文本折叠、图片内联显示

## Impact

**受影响的 specs**:
- **mcp-engine** (修改): 新增工具调用 UI 渲染和状态管理需求
- **chat-core** (修改): Message 需存储 tool call/result 元数据
- **chat-ui-components** (修改): MessageBubble 扩展 tool 类型

**受影响的代码**:
- `src/components/chat/MessageBubble.tsx` - 新增 ToolCallCard 子组件
- `src/components/chat/ToolCallCard.tsx` - 新增，工具调用卡片
- `src/components/chat/McpStatusIndicator.tsx` - 新增，连接状态指示
- `src/app/api/chat/route.ts` - 确保 tool call/result 在流中传递
- `src/services/mcp-service.ts` - 可能需要增加连接状态检查接口
- `src/app/api/mcp/status/route.ts` - 新增，MCP 状态查询 API

**依赖关系**:
- 依赖现有的 `mcp-service.ts` 和 `mcp/client.ts`
- 需要 Vercel AI SDK 的 tool call streaming 支持（已内置）

**预计工作量**: ~3-4 天
