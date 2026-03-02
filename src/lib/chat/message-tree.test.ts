import { describe, expect, it } from "vitest";
import {
  buildMessageChain,
  findCompareGroup,
  findSiblings,
  getDefaultLeaf,
  getDefaultLeafFrom,
  isCompareGroup,
} from "./message-tree";

interface TestMessage {
  id: string;
  parentId: string | null;
  createdAt?: string;
  metadata?: { compareGroupId?: string } | null;
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

  describe("findCompareGroup", () => {
    it("returns all messages with the same compareGroupId", () => {
      const messages: TestMessage[] = [
        { id: "u1", parentId: null, createdAt: "2024-01-01T00:00:00Z" },
        {
          id: "a1",
          parentId: "u1",
          createdAt: "2024-01-02T00:00:00Z",
          metadata: { compareGroupId: "g1" },
        },
        {
          id: "a2",
          parentId: "u1",
          createdAt: "2024-01-03T00:00:00Z",
          metadata: { compareGroupId: "g1" },
        },
        {
          id: "a3",
          parentId: "u1",
          createdAt: "2024-01-04T00:00:00Z",
          metadata: { compareGroupId: "g2" },
        },
      ];

      const group = findCompareGroup(messages, "g1");
      expect(group.map((m) => m.id)).toEqual(["a1", "a2"]);
    });

    it("returns empty for non-existent groupId", () => {
      const messages: TestMessage[] = [
        { id: "u1", parentId: null, createdAt: "2024-01-01T00:00:00Z" },
      ];
      expect(findCompareGroup(messages, "no-such-group")).toEqual([]);
    });

    it("returns empty for empty input", () => {
      expect(findCompareGroup([], "g1")).toEqual([]);
      expect(findCompareGroup([], "")).toEqual([]);
    });
  });

  describe("isCompareGroup", () => {
    it("returns true when children share the same compareGroupId", () => {
      const messages: TestMessage[] = [
        { id: "u1", parentId: null, createdAt: "2024-01-01T00:00:00Z" },
        {
          id: "a1",
          parentId: "u1",
          createdAt: "2024-01-02T00:00:00Z",
          metadata: { compareGroupId: "g1" },
        },
        {
          id: "a2",
          parentId: "u1",
          createdAt: "2024-01-03T00:00:00Z",
          metadata: { compareGroupId: "g1" },
        },
      ];

      expect(isCompareGroup(messages, "u1")).toBe(true);
    });

    it("returns false when children have different compareGroupIds", () => {
      const messages: TestMessage[] = [
        { id: "u1", parentId: null, createdAt: "2024-01-01T00:00:00Z" },
        {
          id: "a1",
          parentId: "u1",
          createdAt: "2024-01-02T00:00:00Z",
          metadata: { compareGroupId: "g1" },
        },
        {
          id: "a2",
          parentId: "u1",
          createdAt: "2024-01-03T00:00:00Z",
          metadata: { compareGroupId: "g2" },
        },
      ];

      expect(isCompareGroup(messages, "u1")).toBe(false);
    });

    it("returns false when children have no compareGroupId", () => {
      const messages: TestMessage[] = [
        { id: "u1", parentId: null, createdAt: "2024-01-01T00:00:00Z" },
        { id: "a1", parentId: "u1", createdAt: "2024-01-02T00:00:00Z" },
        { id: "a2", parentId: "u1", createdAt: "2024-01-03T00:00:00Z" },
      ];

      expect(isCompareGroup(messages, "u1")).toBe(false);
    });

    it("returns false for single child", () => {
      const messages: TestMessage[] = [
        { id: "u1", parentId: null, createdAt: "2024-01-01T00:00:00Z" },
        {
          id: "a1",
          parentId: "u1",
          createdAt: "2024-01-02T00:00:00Z",
          metadata: { compareGroupId: "g1" },
        },
      ];

      expect(isCompareGroup(messages, "u1")).toBe(false);
    });

    it("returns false for empty input", () => {
      expect(isCompareGroup([], "u1")).toBe(false);
    });
  });
});
