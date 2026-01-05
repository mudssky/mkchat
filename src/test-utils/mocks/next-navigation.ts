/**
 * Next.js Navigation Mocks
 *
 * 提供 Next.js navigation hooks 的可复用 Mock
 */

import { vi } from "vitest";

/**
 * 创建 useRouter 的 Mock 实现
 */
export const createMockRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
});

/**
 * 创建 useSearchParams 的 Mock 实现
 */
export const createMockSearchParams = (
  params: Record<string, string> = {},
) => ({
  get: vi.fn((key: string) => params[key] ?? null),
  getAll: vi.fn((key: string) => (params[key] ? [params[key]] : [])),
  has: vi.fn((key: string) => key in params),
  entries: vi.fn(() => Object.entries(params)),
  forEach: vi.fn((callback: (value: string, key: string) => void) => {
    // biome-ignore lint/suspicious/useIterableCallbackReturn: Mock forEach 不需要返回值
    Object.entries(params).forEach(([key, value]) => callback(value, key));
  }),
  keys: vi.fn(() => Object.keys(params)),
  values: vi.fn(() => Object.values(params)),
  toString: vi.fn(() => new URLSearchParams(params).toString()),
});

/**
 * 创建 usePathname 的 Mock 实现
 */
export const createMockPathname = (pathname: string = "/mock-path") => pathname;

/**
 * 导出完整的 Next.js navigation Mock
 */
export const mockNextNavigation = {
  useRouter: createMockRouter,
  useSearchParams: createMockSearchParams,
  usePathname: createMockPathname,
};
