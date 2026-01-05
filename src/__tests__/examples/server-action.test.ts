/**
 * Server Action 测试示例
 *
 * 演示如何测试 Server Actions 和异步函数
 * 注意：不要 render Server Action，直接当做 async function 测试
 */

import { afterEach, describe, expect, it, vi } from "vitest";

// Mock 数据库/API 调用
const mockDb = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

afterEach(() => {
  vi.clearAllMocks();
});

// 示例 Server Action
interface LoginResult {
  success: boolean;
  error?: string;
  user?: { id: string; email: string; name: string };
}

async function loginAction(
  email: string,
  password: string,
): Promise<LoginResult> {
  // 模拟数据库查询
  const user = await mockDb.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  // 模拟密码验证
  if (password !== "correct-password") {
    return { success: false, error: "Invalid password" };
  }

  return {
    success: true,
    user: {
      id: "1",
      email: user.email,
      name: user.name,
    },
  };
}

describe("loginAction (Server Action)", () => {
  it("应该在用户不存在时返回错误", async () => {
    // 安排 (Arrange)
    mockDb.user.findUnique.mockResolvedValue(null);

    // 执行 (Act)
    const result = await loginAction("nonexistent@example.com", "password");

    // 断言 (Assert)
    expect(result).toEqual({
      success: false,
      error: "User not found",
    });
    expect(mockDb.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockDb.user.findUnique).toHaveBeenCalledWith({
      where: { email: "nonexistent@example.com" },
    });
  });

  it("应该在密码错误时返回错误", async () => {
    // 安排
    mockDb.user.findUnique.mockResolvedValue({
      id: "1",
      email: "test@example.com",
      name: "Test User",
      password: "hashed-correct-password",
    });

    // 执行
    const result = await loginAction("test@example.com", "wrong-password");

    // 断言
    expect(result).toEqual({
      success: false,
      error: "Invalid password",
    });
  });

  it("应该在凭证正确时返回成功", async () => {
    // 安排
    const mockUser = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
    };
    mockDb.user.findUnique.mockResolvedValue(mockUser);

    // 执行
    const result = await loginAction("test@example.com", "correct-password");

    // 断言
    expect(result).toEqual({
      success: true,
      user: mockUser,
    });
  });

  it("应该处理数据库错误", async () => {
    // 安排
    mockDb.user.findUnique.mockRejectedValue(
      new Error("Database connection failed"),
    );

    // 执行 & 断言
    await expect(loginAction("test@example.com", "password")).rejects.toThrow(
      "Database connection failed",
    );
  });

  it("应该验证邮箱格式", async () => {
    // 这个示例展示了如何测试输入验证
    const invalidEmails = ["", "invalid", "@example.com", "user@"];

    for (const email of invalidEmails) {
      // 重置 mock
      mockDb.user.findUnique.mockResolvedValue(null);

      // 你可以在 action 开始时添加验证
      // if (!isValidEmail(email)) {
      //   return { success: false, error: 'Invalid email format' }
      // }

      const result = await loginAction(email, "password");
      // 当前实现会返回 "User not found"，因为邮箱格式错误导致查找不到用户
      expect(result.success).toBe(false);
    }
  });
});
