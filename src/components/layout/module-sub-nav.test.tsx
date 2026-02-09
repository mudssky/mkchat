import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModuleSubNav } from "./module-sub-nav";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

const { usePathname } =
  await vi.importMock<typeof import("next/navigation")>("next/navigation");

const items = [
  {
    label: "通用设置",
    href: "/settings/general",
    icon: "⚙️",
    match: "exact" as const,
  },
  {
    label: "模型提供商",
    href: "/settings/providers",
    icon: "🤖",
    match: "prefix" as const,
  },
];

describe("ModuleSubNav 组件", () => {
  it("应该渲染导航项", () => {
    usePathname.mockReturnValue("/settings/general");

    render(<ModuleSubNav items={items} />);

    expect(screen.getByText("通用设置")).toBeInTheDocument();
    expect(screen.getByText("模型提供商")).toBeInTheDocument();
  });

  it("应该按匹配规则高亮激活项", () => {
    usePathname.mockReturnValue("/settings/providers/edit/1");

    render(<ModuleSubNav items={items} />);

    const providersLink = screen.getByText("模型提供商").closest("a");
    const generalLink = screen.getByText("通用设置").closest("a");

    expect(providersLink).toHaveClass("bg-zinc-100", "text-zinc-900");
    expect(generalLink).not.toHaveClass("bg-zinc-100");
  });
});
