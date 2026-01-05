import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// 每个测试后自动清理 DOM
afterEach(() => {
  cleanup();
});

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(() => "mock_value"),
    getAll: vi.fn(() => ["mock_value"]),
    has: vi.fn(() => true),
    entries: vi.fn(() => []),
    forEach: vi.fn(),
    keys: vi.fn(() => []),
    values: vi.fn(() => []),
    toString: vi.fn(() => ""),
  }),
  usePathname: () => "/mock-path",
}));
