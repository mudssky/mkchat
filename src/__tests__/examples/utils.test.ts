/**
 * 工具函数测试示例
 *
 * 演示如何测试纯函数和工具函数
 * 这是 ROI 最高的测试类型！
 */

import { describe, expect, it } from "vitest";

// 示例工具函数
function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

describe("工具函数测试", () => {
  describe("formatCurrency", () => {
    it("应该正确格式化美元金额", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
    });

    it("应该处理整数金额", () => {
      expect(formatCurrency(100)).toBe("$100.00");
    });

    it("应该支持不同的货币", () => {
      expect(formatCurrency(1234.56, "EUR")).toBe("€1,234.56");
      expect(formatCurrency(1234.56, "JPY")).toBe("¥1,235");
    });

    it("应该处理零值", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("应该处理负数", () => {
      expect(formatCurrency(-100)).toBe("-$100.00");
    });
  });

  describe("truncateText", () => {
    it("应该在文本过长时截断", () => {
      expect(truncateText("Hello World", 5)).toBe("Hello...");
    });

    it("应该在文本不超过最大长度时返回原文本", () => {
      expect(truncateText("Hi", 5)).toBe("Hi");
    });

    it("应该处理空字符串", () => {
      expect(truncateText("", 5)).toBe("");
    });

    it("应该在最大长度为 0 时返回省略号", () => {
      expect(truncateText("Hello", 0)).toBe("...");
    });

    it("应该处理中文字符", () => {
      expect(truncateText("你好世界", 2)).toBe("你好...");
    });
  });

  describe("isValidEmail", () => {
    it("应该验证有效的邮箱地址", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@example.com")).toBe(true);
      expect(isValidEmail("user+tag@example.co.uk")).toBe(true);
    });

    it("应该拒绝无效的邮箱地址", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("user@.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });

    it("应该处理边界情况", () => {
      expect(isValidEmail("user@localhost")).toBe(false); // 没有 TLD
      expect(isValidEmail("user name@example.com")).toBe(false); // 包含空格
    });
  });
});
