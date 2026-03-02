import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CompareModelSelection } from "@/store/chat-store";
import { useCompareChat } from "./use-compare-chat";

const mockInvalidateQueries = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

// Helper: encode SSE events into a ReadableStream
function createSSEStream(events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = events.map((e) => encoder.encode(`${e}\n`));
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(chunks[index++]);
      } else {
        controller.close();
      }
    },
  });
}

function sseEvent(obj: Record<string, unknown>): string {
  return `data: ${JSON.stringify(obj)}`;
}

const MODELS: CompareModelSelection[] = [
  { assistantId: "a1", modelId: "gpt-4", providerName: "OpenAI" },
  { assistantId: "a2", modelId: "claude-3", providerName: "Anthropic" },
];

describe("useCompareChat", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
    mockInvalidateQueries.mockReset();
    vi.stubGlobal(
      "crypto",
      Object.assign({}, globalThis.crypto, {
        randomUUID: () => "test-group-id",
      }),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    vi.unstubAllGlobals();
  });
  it("returns idle initial state", () => {
    const { result } = renderHook(() => useCompareChat({ topicId: "t1" }));
    expect(result.current.streams).toEqual([]);
    expect(result.current.isComparing).toBe(false);
    expect(typeof result.current.sendCompare).toBe("function");
    expect(typeof result.current.stopAll).toBe("function");
  });

  it("ignores sendCompare with fewer than 2 models", async () => {
    const { result } = renderHook(() => useCompareChat({ topicId: "t1" }));
    await act(async () => {
      await result.current.sendCompare("hello", [MODELS[0]], null);
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.current.streams).toEqual([]);
  });

  it("sends parallel requests and streams content", async () => {
    const onAllComplete = vi.fn();

    // First request: returns start event with parentId (user msg id)
    const stream1 = createSSEStream([
      sseEvent({
        type: "start",
        messageId: "msg-a1",
        messageMetadata: { parentId: "user-msg-id" },
      }),
      sseEvent({ type: "text-delta", delta: "Hello " }),
      sseEvent({ type: "text-delta", delta: "world" }),
      "data: [DONE]",
    ]);

    // Second request: receives compareParentId
    const stream2 = createSSEStream([
      sseEvent({ type: "start", messageId: "msg-a2" }),
      sseEvent({ type: "text-delta", delta: "Bonjour" }),
      "data: [DONE]",
    ]);

    let callIndex = 0;
    fetchSpy.mockImplementation(async () => {
      const idx = callIndex++;
      return new Response(idx === 0 ? stream1 : stream2, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
    });

    const { result } = renderHook(() =>
      useCompareChat({ topicId: "t1", onAllComplete }),
    );

    await act(async () => {
      await result.current.sendCompare("test", MODELS, "parent-1");
    });

    // Both streams should be completed
    expect(result.current.streams).toHaveLength(2);
    expect(result.current.streams[0].content).toBe("Hello world");
    expect(result.current.streams[0].status).toBe("completed");
    expect(result.current.streams[0].messageId).toBe("msg-a1");
    expect(result.current.streams[1].content).toBe("Bonjour");
    expect(result.current.streams[1].status).toBe("completed");

    // Second request should include compareParentId
    const secondCallBody = JSON.parse(
      (fetchSpy.mock.calls[1] as [string, RequestInit])[1].body as string,
    );
    expect(secondCallBody.compareParentId).toBe("user-msg-id");

    // First request should NOT include compareParentId
    const firstCallBody = JSON.parse(
      (fetchSpy.mock.calls[0] as [string, RequestInit])[1].body as string,
    );
    expect(firstCallBody.compareParentId).toBeUndefined();

    expect(result.current.isComparing).toBe(false);
    expect(onAllComplete).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["topic", "t1"],
    });
  });

  it("handles HTTP error on second request", async () => {
    let callIndex = 0;
    const stream1 = createSSEStream([
      sseEvent({
        type: "start",
        messageId: "msg-a1",
        messageMetadata: { parentId: "user-msg-id" },
      }),
      sseEvent({ type: "text-delta", delta: "ok" }),
      "data: [DONE]",
    ]);

    fetchSpy.mockImplementation(async () => {
      const idx = callIndex++;
      if (idx === 0) {
        return new Response(stream1, {
          status: 200,
          headers: { "Content-Type": "text/event-stream" },
        });
      }
      return new Response("Server Error", { status: 500 });
    });

    const { result } = renderHook(() => useCompareChat({ topicId: "t1" }));

    await act(async () => {
      await result.current.sendCompare("test", MODELS, null);
    });

    expect(result.current.streams[0].status).toBe("completed");
    expect(result.current.streams[0].content).toBe("ok");
    expect(result.current.streams[1].status).toBe("error");
    expect(result.current.streams[1].error).toBe("Server Error");
    expect(result.current.isComparing).toBe(false);
  });

  it("stopAll sets streams to stopped status", async () => {
    // Use a deferred fetch that we control
    let resolveFetch!: (res: Response) => void;
    fetchSpy.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { result } = renderHook(() => useCompareChat({ topicId: "t1" }));

    // Start compare — sendCompare sets initial state synchronously
    await act(async () => {
      // Don't await — sendCompare will hang waiting for fetch
      void result.current.sendCompare("test", MODELS, null);
      // Yield to let React process the synchronous state updates (setStreams, setIsComparing)
      await Promise.resolve();
    });

    // Streams should be in pending state
    expect(result.current.isComparing).toBe(true);
    expect(result.current.streams).toHaveLength(2);
    expect(result.current.streams[0].status).toBe("pending");
    expect(result.current.streams[1].status).toBe("pending");

    // Stop all
    await act(async () => {
      result.current.stopAll();
    });

    expect(result.current.isComparing).toBe(false);
    expect(result.current.streams[0].status).toBe("stopped");
    expect(result.current.streams[1].status).toBe("stopped");

    // Resolve the pending fetch to avoid dangling promises
    const dummyStream = createSSEStream(["data: [DONE]"]);
    resolveFetch(new Response(dummyStream, { status: 200 }));
  });
});
