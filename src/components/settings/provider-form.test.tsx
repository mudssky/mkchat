/**
 * provider-form.test.tsx
 *
 * 冒烟测试：验证 ProviderForm 在不同类型下的渲染
 * ROI: ⭐⭐⭐ (业务组件冒烟测试)
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProviderForm } from "./provider-form";

// Mock Zustand store
vi.mock("@/store/settings-store", () => ({
  useSettingsStore: vi.fn(() => ({
    providers: {},
    upsertProvider: vi.fn(),
  })),
}));

describe("ProviderForm", () => {
  it("renders successfully with default state", () => {
    const { container } = render(<ProviderForm />);
    expect(container).toBeTruthy();
    expect(screen.getByLabelText("提供商类型")).toBeTruthy();
    expect(screen.getByLabelText("API Key")).toBeTruthy();
  });

  it("shows OpenAI 兼容 option in provider select", () => {
    render(<ProviderForm />);
    const select = screen.getByLabelText("提供商类型");
    const options = select.querySelectorAll("option");
    const labels = Array.from(options).map((o) => o.textContent);
    expect(labels).toContain("OpenAI 兼容");
  });

  it("shows extra fields when openai-compatible is selected", async () => {
    const user = userEvent.setup();
    render(<ProviderForm />);

    const select = screen.getByLabelText("提供商类型");
    await user.selectOptions(select, "openai-compatible");

    // 应显示自定义名称、必填 Endpoint、模型 ID 字段
    expect(screen.getByLabelText(/显示名称/)).toBeTruthy();
    expect(screen.getByLabelText(/API Endpoint/)).toBeTruthy();
    expect(screen.getByLabelText("模型 ID")).toBeTruthy();
  });

  it("does not show extra fields for standard OpenAI", async () => {
    const user = userEvent.setup();
    render(<ProviderForm />);

    const select = screen.getByLabelText("提供商类型");
    await user.selectOptions(select, "openai");

    // 不应显示自定义名称和模型 ID 字段
    expect(screen.queryByLabelText(/显示名称/)).toBeNull();
    expect(screen.queryByLabelText("模型 ID")).toBeNull();
  });
});
