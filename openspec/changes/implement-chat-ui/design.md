# Design: implement-chat-ui

## 架构概览

聊天 UI 采用分层架构，将展示层、状态管理和数据访问清晰分离：

```
┌─────────────────────────────────────────────┐
│         Chat Page (/chat/[topicId])         │
│  - 路由参数处理                              │
│  - 页面级布局                                │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         ChatContainer (Client)              │
│  - TanStack Query 数据获取                   │
│  - Zustand 本地状态（当前分支、输入框）       │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼─────────┐
│  MessageList   │   │  MessageInput    │
│  - 消息渲染     │   │  - 输入处理      │
│  - 虚拟滚动     │   │  - 附件上传      │
│  - 分支指示器   │   │  - 发送控制      │
└───────┬────────┘   └────────┬─────────┘
        │                     │
┌───────▼────────┐   ┌────────▼─────────┐
│  MessageBubble │   │  StreamHandler   │
│  - Ant Design X│   │  - Vercel AI SDK │
│  - 编辑/删除    │   │  - 流式渲染      │
└────────────────┘   └──────────────────┘
```

## 核心组件设计

### 1. ChatContainer (容器组件)

**职责**:
- 管理聊天会话的整体状态
- 协调子组件间的数据流
- 处理消息发送和接收

**状态管理**:
```typescript
// Zustand Store
interface ChatStore {
  // 当前活跃的消息分支路径（从根到叶子）
  currentBranchPath: string[];
  
  // 输入框内容（支持草稿保存）
  inputDraft: string;
  
  // UI 状态
  isComposing: boolean;
  
  // Actions
  setCurrentBranch: (path: string[]) => void;
  updateDraft: (content: string) => void;
}
```

**数据获取**:
```typescript
// TanStack Query
const { data: topic } = useQuery({
  queryKey: ['topic', topicId],
  queryFn: () => fetchTopicWithMessages(topicId),
});

const { data: assistant } = useQuery({
  queryKey: ['assistant', topic?.assistantId],
  queryFn: () => fetchAssistant(topic.assistantId),
  enabled: !!topic,
});
```

### 2. MessageList (消息列表)

**职责**:
- 渲染当前分支的消息序列
- 显示分支指示器
- 处理消息编辑和删除

**消息树遍历**:
```typescript
// 从当前叶子节点向上遍历到根节点
function buildMessageChain(
  messages: Message[],
  leafId: string
): Message[] {
  const chain: Message[] = [];
  let current = messages.find(m => m.id === leafId);
  
  while (current) {
    chain.unshift(current);
    current = current.parentId 
      ? messages.find(m => m.id === current.parentId)
      : null;
  }
  
  return chain;
}
```

**分支指示器**:
- 当消息有多个子节点时，显示分支导航按钮
- 点击可切换到兄弟分支
- 使用徽章显示分支数量

### 3. MessageBubble (消息气泡)

**基于 Ant Design X**:
```typescript
import { Bubble } from '@ant-design/x';

interface MessageBubbleProps {
  message: Message;
  onEdit: (id: string) => void;
  onBranch: (id: string) => void;
  hasSiblings: boolean;
}

// 支持的操作
// - 编辑（创建新分支）
// - 复制内容
// - 重新生成（仅 AI 消息）
```

**样式定制**:
- 用户消息：右对齐，蓝色背景
- AI 消息：左对齐，灰色背景
- 系统消息：居中，浅色背景

### 4. MessageInput (输入组件)

**基于 Ant Design X Sender**:
```typescript
import { Sender } from '@ant-design/x';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled: boolean;
  placeholder?: string;
}

// 功能
// - 多行文本输入
// - Ctrl+Enter 发送
// - 附件上传（预留接口）
// - 发送状态指示
```

### 5. StreamHandler (流式响应处理)

**集成 Vercel AI SDK**:
```typescript
import { useChat } from 'ai/react';

const { messages, append, isLoading } = useChat({
  api: '/api/chat',
  body: {
    topicId,
    parentMessageId,
  },
  onFinish: (message) => {
    // 更新本地消息树
    queryClient.invalidateQueries(['topic', topicId]);
  },
});
```

## 数据流设计

### 发送消息流程

```
用户输入 → MessageInput
    ↓
验证内容 → ChatContainer.handleSend()
    ↓
创建用户消息 → POST /api/chat
    ↓
保存到数据库 → 返回消息 ID
    ↓
触发 AI 响应 → Stream 开始
    ↓
实时更新 UI → MessageBubble 渲染
    ↓
Stream 完成 → 保存 AI 消息
    ↓
刷新消息树 → TanStack Query 重新获取
```

### 分支切换流程

```
用户点击分支按钮 → MessageBubble
    ↓
获取兄弟节点列表 → 从 messages 数组筛选
    ↓
显示分支选择器 → Popover/Dropdown
    ↓
用户选择分支 → 更新 currentBranchPath
    ↓
重新计算消息链 → buildMessageChain()
    ↓
重新渲染列表 → MessageList
```

## API 设计

### POST /api/chat

**请求**:
```typescript
interface ChatRequest {
  topicId: string;
  content: string;
  parentMessageId?: string; // 用于创建分支
}
```

**响应**:
```typescript
// Stream (SSE)
data: {"type": "user_message", "id": "msg_123"}
data: {"type": "token", "content": "Hello"}
data: {"type": "token", "content": " world"}
data: {"type": "done", "messageId": "msg_456"}
```

### GET /api/topics/[id]

**响应**:
```typescript
interface TopicResponse {
  id: string;
  assistantId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  parentId: string | null;
  createdAt: string;
}
```

## 性能优化策略

### 1. 虚拟滚动
- 当消息数量 > 100 时启用
- 使用 `react-window` 或 `@tanstack/react-virtual`

### 2. 消息缓存
- TanStack Query 自动缓存
- 5 分钟 stale time
- 后台自动重新验证

### 3. 乐观更新
- 发送消息时立即显示在 UI
- 失败时回滚并显示错误

### 4. 代码分割
- 聊天页面独立 chunk
- 动态导入非关键组件

## 响应式设计

### 桌面端 (≥768px)
```
┌────────────────────────────────────┐
│  Header (Topic Title + Actions)   │
├────────────────────────────────────┤
│                                    │
│         Message List               │
│         (max-width: 800px)         │
│                                    │
├────────────────────────────────────┤
│  Message Input (fixed bottom)     │
└────────────────────────────────────┘
```

### 移动端 (<768px)
```
┌──────────────────┐
│  Compact Header  │
├──────────────────┤
│                  │
│  Message List    │
│  (full width)    │
│                  │
├──────────────────┤
│  Compact Input   │
└──────────────────┘
```

## 错误处理

### 网络错误
- 显示重试按钮
- 保留用户输入内容
- Toast 提示错误信息

### Stream 中断
- 保存已接收的部分内容
- 标记消息为"未完成"
- 提供"继续生成"选项

### 数据不一致
- 检测到冲突时提示用户刷新
- 使用乐观锁（version 字段）

## 可访问性 (a11y)

- 所有交互元素支持键盘导航
- 屏幕阅读器友好的 ARIA 标签
- 足够的颜色对比度（WCAG AA）
- 焦点指示器清晰可见

## 测试策略

### 单元测试
- 消息树遍历逻辑
- 分支切换逻辑
- 输入验证

### 组件测试
- MessageBubble 渲染
- MessageInput 交互
- 分支选择器

### 集成测试
- 完整发送消息流程
- 流式响应处理
- 错误恢复

## 未来扩展点

1. **多模态支持**: 图片、文件、代码块
2. **消息搜索**: 全文搜索和过滤
3. **快捷操作**: 消息引用、@提及
4. **主题定制**: 深色模式、自定义配色
5. **导出功能**: Markdown、PDF 导出
