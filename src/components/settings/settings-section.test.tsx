/**
 * settings-section.test.tsx
 *
 * 测试 SettingsSection 组件
 * ROI: ⭐⭐⭐⭐ (通用 UI 组件，快照测试)
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SettingsSection } from "./settings-section";

describe("SettingsSection 组件", () => {
  // 🟢 冒烟测试
  it("应该能够成功渲染", () => {
    const { container } = render(
      <SettingsSection title="测试标题">
        <p>测试内容</p>
      </SettingsSection>,
    );
    expect(container).toBeTruthy();
  });

  // 🟡 快照测试
  describe("快照测试", () => {
    it("应该匹配基础快照（只有标题）", () => {
      const { container } = render(
        <SettingsSection title="通用设置">
          <div>内容区域</div>
        </SettingsSection>,
      );
      expect(container).toMatchSnapshot();
    });

    it("应该匹配带描述的快照", () => {
      const { container } = render(
        <SettingsSection title="通用设置" description="管理您的账户和偏好设置">
          <div>内容区域</div>
        </SettingsSection>,
      );
      expect(container).toMatchSnapshot();
    });

    it("应该匹配带自定义 className 的快照", () => {
      const { container } = render(
        <SettingsSection title="测试" className="custom-class">
          <div>内容</div>
        </SettingsSection>,
      );
      expect(container).toMatchSnapshot();
    });

    it("应该匹配带多个子元素的快照", () => {
      const { container } = render(
        <SettingsSection title="表单设置">
          <input type="text" placeholder="输入框 1" />
          <input type="text" placeholder="输入框 2" />
          <button type="button">保存</button>
        </SettingsSection>,
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe("内容渲染", () => {
    it("应该显示标题", () => {
      render(
        <SettingsSection title="我的设置">
          <div>内容</div>
        </SettingsSection>,
      );

      expect(screen.getByText("我的设置")).toBeInTheDocument();
    });

    it("应该显示描述（如果提供）", () => {
      render(
        <SettingsSection title="设置" description="这是设置描述">
          <div>内容</div>
        </SettingsSection>,
      );

      expect(screen.getByText("这是设置描述")).toBeInTheDocument();
    });

    it("应该不显示描述（如果不提供）", () => {
      render(
        <SettingsSection title="设置">
          <div>内容</div>
        </SettingsSection>,
      );

      const description = screen.queryByText(/描述/);
      expect(description).not.toBeInTheDocument();
    });

    it("应该渲染子元素", () => {
      render(
        <SettingsSection title="设置">
          <p>第一段内容</p>
          <p>第二段内容</p>
        </SettingsSection>,
      );

      expect(screen.getByText("第一段内容")).toBeInTheDocument();
      expect(screen.getByText("第二段内容")).toBeInTheDocument();
    });
  });

  describe("样式类名", () => {
    it("应该应用自定义 className", () => {
      const { container } = render(
        <SettingsSection title="测试" className="mt-4">
          <div>内容</div>
        </SettingsSection>,
      );

      const section = container.querySelector("section");
      expect(section).toHaveClass("mt-4");
    });

    it("应该保留默认类名", () => {
      const { container } = render(
        <SettingsSection title="测试">
          <div>内容</div>
        </SettingsSection>,
      );

      const section = container.querySelector("section");
      expect(section).toHaveClass("space-y-6");
    });

    it("应该合并自定义和默认类名", () => {
      const { container } = render(
        <SettingsSection title="测试" className="p-4">
          <div>内容</div>
        </SettingsSection>,
      );

      const section = container.querySelector("section");
      expect(section).toHaveClass("space-y-6");
      expect(section).toHaveClass("p-4");
    });
  });

  describe("可访问性", () => {
    it("应该使用正确的语义化标签", () => {
      const { container } = render(
        <SettingsSection title="设置">
          <div>内容</div>
        </SettingsSection>,
      );

      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();

      const heading = container.querySelector("h2");
      expect(heading).toBeInTheDocument();
    });
  });
});
