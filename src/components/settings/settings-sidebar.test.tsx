/**
 * settings-sidebar.test.tsx
 *
 * 测试 SettingsSidebar 组件
 * ROI: ⭐⭐⭐⭐ (通用 UI 组件，快照测试)
 */

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsSidebar } from "./settings-sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

// 导入 mock 以便在测试中控制返回值
const { usePathname } =
  await vi.importMock<typeof import("next/navigation")>("next/navigation");

describe("SettingsSidebar 组件", () => {
  // 🟢 冒烟测试
  it("应该能够成功渲染", () => {
    usePathname.mockReturnValue("/settings/general");

    expect(render(<SettingsSidebar />)).toBeTruthy();
  });

  // 🟡 快照测试
  describe("快照测试", () => {
    it("应该匹配通用设置页面的快照", () => {
      usePathname.mockReturnValue("/settings/general");

      const { container } = render(<SettingsSidebar />);
      expect(container).toMatchSnapshot();
    });

    it("应该匹配提供商设置页面的快照", () => {
      usePathname.mockReturnValue("/settings/providers");

      const { container } = render(<SettingsSidebar />);
      expect(container).toMatchSnapshot();
    });

    it("应该匹配 MCP 工具页面的快照", () => {
      usePathname.mockReturnValue("/settings/mcp");

      const { container } = render(<SettingsSidebar />);
      expect(container).toMatchSnapshot();
    });

    it("应该匹配带自定义 className 的快照", () => {
      usePathname.mockReturnValue("/settings/general");

      const { container } = render(
        <SettingsSidebar className="custom-class" />,
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe("导航项渲染", () => {
    beforeEach(() => {
      usePathname.mockReturnValue("/settings/general");
    });

    it("应该显示所有导航项", () => {
      render(<SettingsSidebar />);

      expect(screen.getByText("通用设置")).toBeInTheDocument();
      expect(screen.getByText("模型提供商")).toBeInTheDocument();
      expect(screen.getByText("MCP 工具")).toBeInTheDocument();
    });

    it("应该显示导航图标", () => {
      render(<SettingsSidebar />);

      expect(screen.getByText("⚙️")).toBeInTheDocument();
      expect(screen.getByText("🤖")).toBeInTheDocument();
      expect(screen.getByText("🔌")).toBeInTheDocument();
    });

    it("应该渲染正确的链接数量", () => {
      const { container } = render(<SettingsSidebar />);

      const links = container.querySelectorAll("a");
      expect(links).toHaveLength(3);
    });
  });

  describe("激活状态", () => {
    it("应该在通用设置页面高亮显示", () => {
      usePathname.mockReturnValue("/settings/general");

      render(<SettingsSidebar />);

      const generalLink = screen.getByText("通用设置").closest("a");
      expect(generalLink).toHaveClass("bg-zinc-100");
      expect(generalLink).toHaveClass("text-zinc-900");
    });

    it("应该在提供商设置页面高亮显示", () => {
      usePathname.mockReturnValue("/settings/providers");

      render(<SettingsSidebar />);

      const providersLink = screen.getByText("模型提供商").closest("a");
      expect(providersLink).toHaveClass("bg-zinc-100");
      expect(providersLink).toHaveClass("text-zinc-900");
    });

    it("应该在 MCP 工具页面高亮显示", () => {
      usePathname.mockReturnValue("/settings/mcp");

      render(<SettingsSidebar />);

      const mcpLink = screen.getByText("MCP 工具").closest("a");
      expect(mcpLink).toHaveClass("bg-zinc-100");
      expect(mcpLink).toHaveClass("text-zinc-900");
    });

    it("应该不激活不匹配的页面", () => {
      usePathname.mockReturnValue("/settings/general");

      render(<SettingsSidebar />);

      const providersLink = screen.getByText("模型提供商").closest("a");
      expect(providersLink).not.toHaveClass("bg-zinc-100");
      expect(providersLink).toHaveClass("text-zinc-600");
    });

    it("应该处理子路径激活", () => {
      usePathname.mockReturnValue("/settings/providers/edit/123");

      render(<SettingsSidebar />);

      const providersLink = screen.getByText("模型提供商").closest("a");
      expect(providersLink).toHaveClass("bg-zinc-100");
    });
  });

  describe("链接行为", () => {
    it("应该正确设置 href 属性", () => {
      usePathname.mockReturnValue("/settings/general");

      render(<SettingsSidebar />);

      const generalLink = screen.getByText("通用设置").closest("a");
      expect(generalLink).toHaveAttribute("href", "/settings/general");

      const providersLink = screen.getByText("模型提供商").closest("a");
      expect(providersLink).toHaveAttribute("href", "/settings/providers");

      const mcpLink = screen.getByText("MCP 工具").closest("a");
      expect(mcpLink).toHaveAttribute("href", "/settings/mcp");
    });
  });

  describe("样式类名", () => {
    it("应该应用自定义 className", () => {
      usePathname.mockReturnValue("/settings/general");

      const { container } = render(<SettingsSidebar className="w-80" />);

      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("w-80");
    });

    it("应该保留默认类名", () => {
      usePathname.mockReturnValue("/settings/general");

      const { container } = render(<SettingsSidebar />);

      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("w-64");
      expect(aside).toHaveClass("border-r");
      expect(aside).toHaveClass("border-zinc-200");
    });
  });

  describe("响应式和主题", () => {
    it("应该应用深色模式类名", () => {
      usePathname.mockReturnValue("/settings/general");

      const { container } = render(<SettingsSidebar />);

      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("dark:border-zinc-800");
      expect(aside).toHaveClass("dark:bg-zinc-950");
    });

    it("应该在激活状态应用深色模式样式", () => {
      usePathname.mockReturnValue("/settings/general");

      render(<SettingsSidebar />);

      const activeLink = screen.getByText("通用设置").closest("a");
      expect(activeLink).toHaveClass("dark:bg-zinc-800");
      expect(activeLink).toHaveClass("dark:text-zinc-50");
    });

    it("应该在非激活状态应用深色模式样式", () => {
      usePathname.mockReturnValue("/settings/general");

      render(<SettingsSidebar />);

      const inactiveLink = screen.getByText("模型提供商").closest("a");
      expect(inactiveLink).toHaveClass("dark:text-zinc-400");
    });
  });

  describe("边界情况", () => {
    it("应该处理 pathname 为 undefined 的情况", () => {
      usePathname.mockReturnValue(undefined as unknown as string);

      const { container } = render(<SettingsSidebar />);

      // 不应该有任何激活的链接
      const links = container.querySelectorAll("a");
      links.forEach((link) => {
        expect(link).not.toHaveClass("bg-zinc-100");
      });
    });

    it("应该处理 pathname 为空字符串的情况", () => {
      usePathname.mockReturnValue("");

      const { container } = render(<SettingsSidebar />);

      // 不应该有任何激活的链接
      const links = container.querySelectorAll("a");
      links.forEach((link) => {
        expect(link).not.toHaveClass("bg-zinc-100");
      });
    });
  });
});
