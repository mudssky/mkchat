/**
 * top-bar.test.tsx
 *
 * 测试 TopBar 组件
 * ROI: ⭐⭐⭐⭐ (通用 UI 组件，快照测试)
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TopBar } from "./top-bar";

describe("TopBar 组件", () => {
  it("应该能够成功渲染", () => {
    expect(
      render(
        <TopBar
          title="会话列表"
          subtitle="选择助手或继续历史会话"
          status={{ label: "模型状态：未知" }}
        />,
      ),
    ).toBeTruthy();
  });

  it("应该匹配快照", () => {
    const { container } = render(
      <TopBar
        title="AI Assistant"
        subtitle="会话 · topic-123"
        leading="A"
        status={{ label: "模型状态：未知", tone: "neutral" }}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
