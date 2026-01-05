/**
 * 组件测试示例
 *
 * 演示如何测试 React 组件
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// 示例组件
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

function Button({
  children,
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded ${className}`}
    >
      {children}
    </button>
  );
}

describe("Button 组件", () => {
  // 🟢 策略 1: 冒烟测试 (最省事，只测不崩)
  it("应该能够成功渲染", () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container).toBeTruthy();
  });

  // 🟡 策略 2: 快照测试 (测结构变动)
  it("应该匹配快照", () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container).toMatchSnapshot();
  });

  // 🔴 策略 3: 交互测试 (测点击/输入)
  it("应该响应点击事件", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("禁用状态时不应触发点击事件", () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>,
    );

    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it("应该显示正确的文本内容", () => {
    render(<Button>Submit</Button>);
    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).toHaveTextContent("Submit");
  });

  it("应该应用自定义 className", () => {
    const { container } = render(
      <Button className="bg-blue-500">Click me</Button>,
    );
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-blue-500");
  });
});
