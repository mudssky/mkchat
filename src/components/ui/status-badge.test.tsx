/**
 * status-badge.test.tsx
 *
 * 测试 StatusBadge 组件
 * ROI: ⭐⭐⭐⭐ (通用 UI 组件，快照测试)
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

describe("StatusBadge 组件", () => {
  it("应该能够成功渲染", () => {
    expect(render(<StatusBadge label="模型可用" />)).toBeTruthy();
  });

  it("应该匹配快照", () => {
    const { container } = render(
      <div className="space-y-2">
        <StatusBadge label="默认" />
        <StatusBadge label="成功" tone="success" />
        <StatusBadge label="警告" tone="warning" size="xs" />
        <StatusBadge label="信息" tone="info" tooltip="提示文案" />
      </div>,
    );

    expect(container).toMatchSnapshot();
  });
});
