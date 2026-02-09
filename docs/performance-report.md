# Chat 性能优化报告

## 审计范围

- 聊天页面首屏渲染
- 长消息链渲染与滚动
- 流式响应期间 UI 更新频率
- 前端包体积优化配置

## 已实施优化

1. **流式渲染节流**
   - `useChat` 使用 `experimental_throttle: 50`，控制更新频率。
2. **列表自动滚动优化**
   - 使用 `requestAnimationFrame` 调度自动滚动。
3. **大数据量虚拟化**
   - 在消息数量/长度阈值触发 `@tanstack/react-virtual`。
4. **Markdown 渲染防抖**
   - 消息气泡内对内容渲染执行短延迟防抖。
5. **包优化**
   - 在 `next.config.ts` 启用 `experimental.optimizePackageImports`。
6. **开发态性能监控**
   - 增加 `mkchat:chat-performance` 指标事件与页面面板展示。
7. **首屏数据预取**
   - 在聊天页服务端预取 Topic + Message 并注入 `ChatContainer` 初始数据，降低首屏空加载状态。
8. **开发工具代码分割**
   - `ReactQueryDevtools` 改为 `React.lazy` + `Suspense`，避免主包提前加载调试代码。
9. **静态资源缓存策略**
   - 在 `next.config.ts` 增加静态资源缓存响应头，并启用 `images.formats` 与 `minimumCacheTTL`。

## 关键指标（开发态）

- `message-chain-build`
- `ui-message-normalize`
- `message-list-auto-scroll`

## Lighthouse

- 执行建议：
  1. 启动应用 `pnpm dev`
  2. 打开 `http://127.0.0.1:32303/chat/<topicId>`
  3. 使用 Chrome DevTools Lighthouse（Performance）运行审计

> 当前仓库未内置 CI Lighthouse 脚本，报告由本地审计流程生成。
