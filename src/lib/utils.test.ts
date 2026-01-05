/**
 * utils.test.ts
 *
 * 测试通用工具函数
 * ROI: ⭐⭐⭐⭐⭐ (纯逻辑，最稳定的测试类型)
 */

import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn (类名合并工具)", () => {
  describe("基本功能", () => {
    it("应该合并多个类名", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("应该处理空字符串", () => {
      expect(cn("foo", "", "bar")).toBe("foo bar");
    });

    it("应该处理 undefined 和 null", () => {
      expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });

    it("应该处理空输入", () => {
      expect(cn()).toBe("");
    });
  });

  describe("条件类名", () => {
    it("应该处理条件对象", () => {
      expect(
        cn({
          foo: true,
          bar: false,
          baz: true,
        }),
      ).toBe("foo baz");
    });

    it("应该处理混合输入", () => {
      expect(cn("base", { active: true, disabled: false }, "extra")).toBe(
        "base active extra",
      );
    });

    it("应该处理数组输入", () => {
      expect(cn(["foo", "bar"])).toBe("foo bar");
    });

    it("应该处理嵌套数组", () => {
      expect(cn([["foo", "bar"], "baz"])).toBe("foo bar baz");
    });
  });

  describe("Tailwind 类名冲突处理", () => {
    it("应该解决 Tailwind 类名冲突（后者优先）", () => {
      expect(cn("px-4", "px-6")).toBe("px-6");
    });

    it("应该处理多个冲突的类名", () => {
      expect(cn("px-4 py-2 bg-blue-500", "px-6 bg-red-500")).toBe(
        "py-2 px-6 bg-red-500",
      );
    });

    it("应该保留不冲突的类名", () => {
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    });

    it("应该处理包含冲突的复杂类名组合", () => {
      expect(
        cn({
          "px-4 py-2": true,
          "px-6 bg-blue-500": false,
        }),
      ).toBe("px-4 py-2");
    });
  });

  describe("实际使用场景", () => {
    it("应该处理动态类名（按钮组件场景）", () => {
      const isActive = true;
      const isDisabled = false;

      expect(
        cn(
          "px-4 py-2 rounded",
          isActive && "bg-blue-500",
          isDisabled && "opacity-50",
        ),
      ).toBe("px-4 py-2 rounded bg-blue-500");
    });

    it("应该处理响应式类名", () => {
      expect(cn("px-4 md:px-6 lg:px-8", "py-2 md:py-3")).toBe(
        "px-4 md:px-6 lg:px-8 py-2 md:py-3",
      );
    });

    it("应该处理状态变体", () => {
      const variant = "primary" as string;
      const size = "large";

      expect(
        cn(
          "btn",
          variant === "primary" && "btn-primary",
          variant === "secondary" && "btn-secondary",
          size === "large" && "btn-lg",
        ),
      ).toBe("btn btn-primary btn-lg");
    });
  });

  describe("边界情况", () => {
    it("应该处理布尔值", () => {
      expect(cn(true && "foo", false && "bar")).toBe("foo");
    });

    it("应该处理数字", () => {
      expect(cn(1 && "foo", 0 && "bar")).toBe("foo");
    });

    it("应该处理特殊字符", () => {
      expect(cn("foo-1/2", "bar-2/3")).toBe("foo-1/2 bar-2/3");
    });

    it("应该处理 Tailwind 重复类名（去重）", () => {
      // tailwind-merge 会识别并去重 Tailwind 类名
      expect(cn("px-4", "px-4", "py-2")).toBe("px-4 py-2");
    });

    it("应该保留非 Tailwind 重复类名", () => {
      // 非Tailwind类名不会被去重
      expect(cn("custom-class", "custom-class", "another")).toBe(
        "custom-class custom-class another",
      );
    });
  });
});
