import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageFrame } from "./page-frame";

describe("PageFrame 组件", () => {
  it("应该能够成功渲染", () => {
    expect(
      render(
        <PageFrame>
          <div>content</div>
        </PageFrame>,
      ),
    ).toBeTruthy();
  });

  it("应该按预设应用宽度与节奏类名", () => {
    const { container } = render(
      <PageFrame widthPreset="chat" density="compact">
        <div>chat</div>
      </PageFrame>,
    );

    const main = container.querySelector("main");
    const inner = container.querySelector("main > div");

    expect(main).toHaveClass("px-4", "sm:px-6", "py-6");
    expect(inner).toHaveClass("max-w-[800px]");
  });
});
