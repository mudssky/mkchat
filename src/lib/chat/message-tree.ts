interface MessageNode {
  id: string;
  parentId: string | null;
  createdAt?: Date | string | null;
}

function toTimestamp(value?: Date | string | null): number {
  if (!value) return 0;
  const date = typeof value === "string" ? new Date(value) : value;
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortByCreatedAt<T extends MessageNode>(messages: T[]): T[] {
  return [...messages].sort(
    (a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt),
  );
}

export function buildMessageChain<T extends MessageNode>(
  messages: T[],
  leafId: string,
): T[] {
  if (!leafId || messages.length === 0) return [];

  const messageMap = new Map(messages.map((message) => [message.id, message]));
  const chain: T[] = [];
  const visited = new Set<string>();
  let current = messageMap.get(leafId) ?? null;

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    chain.unshift(current);
    current = current.parentId
      ? (messageMap.get(current.parentId) ?? null)
      : null;
  }

  return chain;
}

export function findSiblings<T extends MessageNode>(
  messages: T[],
  messageId: string,
): T[] {
  if (!messageId || messages.length === 0) return [];

  const target = messages.find((message) => message.id === messageId);
  if (!target) return [];

  const siblings = messages.filter(
    (message) =>
      message.parentId === target.parentId && message.id !== messageId,
  );

  return sortByCreatedAt(siblings);
}

export function getDefaultLeaf<T extends MessageNode>(messages: T[]): T | null {
  if (messages.length === 0) return null;

  const parentIds = new Set<string>();
  for (const message of messages) {
    if (message.parentId) {
      parentIds.add(message.parentId);
    }
  }

  const leafCandidates = messages.filter(
    (message) => !parentIds.has(message.id),
  );
  const ordered = sortByCreatedAt(
    leafCandidates.length > 0 ? leafCandidates : messages,
  );

  return ordered[0] ?? null;
}

export function getChildrenMap<T extends MessageNode>(messages: T[]) {
  const map = new Map<string, T[]>();
  for (const message of messages) {
    if (!message.parentId) continue;
    const siblings = map.get(message.parentId);
    if (siblings) {
      siblings.push(message);
    } else {
      map.set(message.parentId, [message]);
    }
  }
  return map;
}

export function getDefaultLeafFrom<T extends MessageNode>(
  messages: T[],
  startId: string,
): T | null {
  const childrenMap = getChildrenMap(messages);
  let current = messages.find((message) => message.id === startId) ?? null;

  while (current) {
    const children = childrenMap.get(current.id);
    if (!children || children.length === 0) {
      return current;
    }
    const ordered = sortByCreatedAt(children);
    current = ordered[0] ?? null;
  }

  return null;
}
