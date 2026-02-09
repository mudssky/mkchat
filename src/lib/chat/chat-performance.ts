export type ChatPerformanceMetricName =
  | "message-chain-build"
  | "ui-message-normalize"
  | "message-list-auto-scroll";

export interface ChatPerformanceMetadata {
  messageCount?: number;
  virtualized?: boolean;
}

export interface ChatPerformanceMetric extends ChatPerformanceMetadata {
  name: ChatPerformanceMetricName;
  durationMs: number;
}

export type ChatPerformanceReporter = (metric: ChatPerformanceMetric) => void;

export const CHAT_PERFORMANCE_EVENT = "mkchat:chat-performance";

// 允许测试或外部模块注入自定义上报器。
let performanceReporter: ChatPerformanceReporter | null = null;

export function setChatPerformanceReporter(
  reporter: ChatPerformanceReporter | null,
) {
  performanceReporter = reporter;
}

/**
 * 上报一次聊天性能指标，并在浏览器端派发事件供调试面板消费。
 */
export function reportChatPerformance(metric: ChatPerformanceMetric) {
  performanceReporter?.(metric);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ChatPerformanceMetric>(CHAT_PERFORMANCE_EVENT, {
        detail: metric,
      }),
    );
  }
}

function getCurrentTimestamp() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

/**
 * 测量同步逻辑耗时并自动上报，返回原始计算结果。
 */
export function measureChatPerformance<T>(
  name: ChatPerformanceMetricName,
  producer: () => T,
  metadata: ChatPerformanceMetadata = {},
): T {
  const startedAt = getCurrentTimestamp();
  const value = producer();
  const finishedAt = getCurrentTimestamp();

  reportChatPerformance({
    name,
    durationMs: Math.max(0, finishedAt - startedAt),
    ...metadata,
  });

  return value;
}
