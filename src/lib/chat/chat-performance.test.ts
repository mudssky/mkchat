import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHAT_PERFORMANCE_EVENT,
  measureChatPerformance,
  setChatPerformanceReporter,
} from "./chat-performance";

describe("chat-performance", () => {
  afterEach(() => {
    setChatPerformanceReporter(null);
  });

  it("reports measured duration to custom reporter", () => {
    const reporter = vi.fn();
    setChatPerformanceReporter(reporter);

    const result = measureChatPerformance("ui-message-normalize", () => "ok", {
      messageCount: 3,
    });

    expect(result).toBe("ok");
    expect(reporter).toHaveBeenCalledTimes(1);
    expect(reporter).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "ui-message-normalize",
        messageCount: 3,
      }),
    );
  });

  it("emits browser event when window exists", () => {
    const listener = vi.fn();
    window.addEventListener(CHAT_PERFORMANCE_EVENT, listener);

    measureChatPerformance("message-chain-build", () => null, {
      messageCount: 1,
      virtualized: false,
    });

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(CHAT_PERFORMANCE_EVENT, listener);
  });
});
