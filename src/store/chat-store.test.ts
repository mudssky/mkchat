import { beforeEach, describe, expect, it } from "vitest";
import { useChatStore } from "./chat-store";

function getPersistedState() {
  const raw = localStorage.getItem("mkchat-chat");
  if (!raw) return null;
  return JSON.parse(raw) as { state?: Record<string, unknown> };
}

describe("chat-store", () => {
  beforeEach(() => {
    localStorage.clear();
    useChatStore.setState(
      {
        currentBranchPath: [],
        inputDraft: "",
        isComposing: false,
        setCurrentBranch: useChatStore.getState().setCurrentBranch,
        updateDraft: useChatStore.getState().updateDraft,
        setIsComposing: useChatStore.getState().setIsComposing,
        reset: useChatStore.getState().reset,
      },
      true,
    );
  });

  it("updates branch path", () => {
    useChatStore.getState().setCurrentBranch(["a", "b"]);
    expect(useChatStore.getState().currentBranchPath).toEqual(["a", "b"]);
  });

  it("updates input draft", () => {
    useChatStore.getState().updateDraft("hello");
    expect(useChatStore.getState().inputDraft).toBe("hello");
  });

  it("updates composing state", () => {
    useChatStore.getState().setIsComposing(true);
    expect(useChatStore.getState().isComposing).toBe(true);
  });

  it("persists draft and branch path", () => {
    useChatStore.getState().updateDraft("draft");
    useChatStore.getState().setCurrentBranch(["root"]);

    const persisted = getPersistedState();
    expect(persisted?.state?.inputDraft).toBe("draft");
    expect(persisted?.state?.currentBranchPath).toEqual(["root"]);
  });

  it("resets to initial state", () => {
    useChatStore.getState().updateDraft("draft");
    useChatStore.getState().setCurrentBranch(["root"]);
    useChatStore.getState().setIsComposing(true);

    useChatStore.getState().reset();

    expect(useChatStore.getState().inputDraft).toBe("");
    expect(useChatStore.getState().currentBranchPath).toEqual([]);
    expect(useChatStore.getState().isComposing).toBe(false);
  });
});
