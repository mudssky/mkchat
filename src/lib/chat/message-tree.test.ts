import { describe, expect, it } from "vitest";
import {
  buildMessageChain,
  findSiblings,
  getDefaultLeaf,
  getDefaultLeafFrom,
} from "./message-tree";

interface TestMessage {
  id: string;
  parentId: string | null;
  createdAt?: string;
}

describe("message-tree", () => {
  it("returns empty results for empty input", () => {
    expect(buildMessageChain([], "m1")).toEqual([]);
    expect(findSiblings([], "m1")).toEqual([]);
    expect(getDefaultLeaf([])).toBeNull();
  });

  it("builds a chain from leaf to root", () => {
    const messages: TestMessage[] = [
      { id: "root", parentId: null, createdAt: "2024-01-01T00:00:00Z" },
      { id: "child", parentId: "root", createdAt: "2024-01-02T00:00:00Z" },
      { id: "leaf", parentId: "child", createdAt: "2024-01-03T00:00:00Z" },
    ];

    const chain = buildMessageChain(messages, "leaf");

    expect(chain.map((item) => item.id)).toEqual(["root", "child", "leaf"]);
  });

  it("finds siblings with the same parent", () => {
    const messages: TestMessage[] = [
      { id: "root", parentId: null, createdAt: "2024-01-01T00:00:00Z" },
      { id: "a", parentId: "root", createdAt: "2024-01-02T00:00:00Z" },
      { id: "b", parentId: "root", createdAt: "2024-01-03T00:00:00Z" },
    ];

    const siblings = findSiblings(messages, "a");

    expect(siblings.map((item) => item.id)).toEqual(["b"]);
  });

  it("picks the earliest leaf as default", () => {
    const messages: TestMessage[] = [
      { id: "root", parentId: null, createdAt: "2024-01-01T00:00:00Z" },
      { id: "branch-a", parentId: "root", createdAt: "2024-01-02T00:00:00Z" },
      { id: "branch-b", parentId: "root", createdAt: "2024-01-05T00:00:00Z" },
      { id: "leaf-a", parentId: "branch-a", createdAt: "2024-01-03T00:00:00Z" },
      { id: "leaf-b", parentId: "branch-b", createdAt: "2024-01-06T00:00:00Z" },
    ];

    const leaf = getDefaultLeaf(messages);

    expect(leaf?.id).toBe("leaf-a");
  });

  it("selects a default leaf from a subtree", () => {
    const messages: TestMessage[] = [
      { id: "root", parentId: null, createdAt: "2024-01-01T00:00:00Z" },
      { id: "a", parentId: "root", createdAt: "2024-01-02T00:00:00Z" },
      { id: "b", parentId: "root", createdAt: "2024-01-03T00:00:00Z" },
      { id: "a1", parentId: "a", createdAt: "2024-01-04T00:00:00Z" },
      { id: "a2", parentId: "a", createdAt: "2024-01-05T00:00:00Z" },
    ];

    const leaf = getDefaultLeafFrom(messages, "a");

    expect(leaf?.id).toBe("a1");
  });
});
