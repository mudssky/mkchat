/**
 * app-shell.test.tsx
 *
 * 测试 AppShell 组件
 * ROI: ⭐⭐⭐⭐ (布局组件，快照测试)
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

const { usePathname } =
  await vi.importMock<typeof import("next/navigation")>("next/navigation");

describe("AppShell 组件", () => {
  it("应该能够成功渲染", () => {
    usePathname.mockReturnValue("/conversations");

    expect(
      render(
        <AppShell>
          <div>Content</div>
        </AppShell>,
      ),
    ).toBeTruthy();
  });

  it("应该渲染导航项", () => {
    usePathname.mockReturnValue("/conversations");

    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getByText("首页")).toBeInTheDocument();
    expect(screen.getByText("会话列表")).toBeInTheDocument();
    expect(screen.getByText("设置")).toBeInTheDocument();
  });

  it("应该高亮当前导航项", () => {
    usePathname.mockReturnValue("/conversations");

    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    const activeLink = screen.getByText("会话列表").closest("a");
    expect(activeLink).toHaveClass("bg-zinc-100");
  });
});
