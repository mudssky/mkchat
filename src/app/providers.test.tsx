import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SettingsStore, ThemeMode } from "@/types/settings";
import { Providers } from "./providers";

vi.mock("@/store/settings-store", () => ({
  useSettingsStore: vi.fn(),
}));

vi.mock("@tanstack/react-query-devtools", () => ({
  ReactQueryDevtools: () => null,
}));

const { useSettingsStore } = await vi.importMock<
  typeof import("@/store/settings-store")
>("@/store/settings-store");

function createMockSettingsStore(theme: ThemeMode): SettingsStore {
  return {
    theme,
    language: "zh-CN",
    providers: {},
    mcpServers: [],
    setTheme: vi.fn(),
    setLanguage: vi.fn(),
    upsertProvider: vi.fn(),
    removeProvider: vi.fn(),
    getProvider: vi.fn(),
    addMcpServer: vi.fn(),
    updateMcpServer: vi.fn(),
    removeMcpServer: vi.fn(),
    updateMcpServerStatus: vi.fn(),
  };
}

describe("Providers 主题策略", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  it("system 模式应跟随系统主题", async () => {
    useSettingsStore.mockImplementation(
      (selector: (state: SettingsStore) => unknown) =>
        selector(createMockSettingsStore("system")),
    );

    const mediaQueryList = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => mediaQueryList),
    );

    render(
      <Providers>
        <div>app</div>
      </Providers>,
    );

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    });

    vi.unstubAllGlobals();
  });

  it("light 模式应显式覆盖主题", async () => {
    useSettingsStore.mockImplementation(
      (selector: (state: SettingsStore) => unknown) =>
        selector(createMockSettingsStore("light")),
    );

    render(
      <Providers>
        <div>app</div>
      </Providers>,
    );

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "light");
    });
  });
});
