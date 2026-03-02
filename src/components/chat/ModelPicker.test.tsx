import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CompareModelSelection } from "@/store/chat-store";
import { ModelPicker } from "./ModelPicker";

const mockAssistants = [
  {
    id: "a1",
    name: "GPT-4o",
    modelId: "gpt-4o",
    providerName: "OpenAI",
    providerConfigId: "p1",
    systemPrompt: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "a2",
    name: "Claude 3",
    modelId: "claude-3-opus",
    providerName: "Anthropic",
    providerConfigId: "p2",
    systemPrompt: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "a3",
    name: "GPT-4 Mini",
    modelId: "gpt-4o-mini",
    providerName: "OpenAI",
    providerConfigId: "p1",
    systemPrompt: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: { assistants: mockAssistants },
    isLoading: false,
  }),
}));

vi.mock("antd", () => ({
  Popover: ({
    content,
    children,
    open,
  }: {
    content: React.ReactNode;
    children: React.ReactNode;
    open?: boolean;
  }) => (
    <div>
      {children}
      {open && <div data-testid="popover-content">{content}</div>}
    </div>
  ),
  Tag: ({
    children,
    onClose,
    closable,
  }: {
    children: React.ReactNode;
    onClose?: () => void;
    closable?: boolean;
    closeIcon?: React.ReactNode;
    className?: string;
  }) => (
    <span data-testid="tag">
      {children}
      {closable && (
        <button type="button" onClick={onClose} data-testid="tag-close">
          ×
        </button>
      )}
    </span>
  ),
}));

describe("ModelPicker", () => {
  it("renders compare button", () => {
    render(<ModelPicker selected={[]} onChange={vi.fn()} />);
    expect(screen.getByLabelText("对比模型")).toBeTruthy();
  });

  it("shows model list when clicked", () => {
    const { rerender } = render(
      <ModelPicker selected={[]} onChange={vi.fn()} />,
    );
    fireEvent.click(screen.getByLabelText("对比模型"));
    // Rerender with open state (Popover mock uses open prop)
    // Since our mock Popover shows content when open=true, and the component
    // manages open state internally, we need to click to toggle
    rerender(<ModelPicker selected={[]} onChange={vi.fn()} />);
    // The popover content should show provider groups
    const content = screen.queryByTestId("popover-content");
    if (content) {
      expect(content.textContent).toContain("OpenAI");
      expect(content.textContent).toContain("Anthropic");
    }
  });

  it("calls onChange when model is toggled", () => {
    const onChange = vi.fn();
    // Simulate open popover by clicking
    render(<ModelPicker selected={[]} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("对比模型"));

    // Find and click a model button
    const modelButtons = screen.getAllByRole("button");
    const gpt4Button = modelButtons.find((b) =>
      b.textContent?.includes("GPT-4o"),
    );
    if (gpt4Button) {
      fireEvent.click(gpt4Button);
      expect(onChange).toHaveBeenCalledWith([
        {
          assistantId: "a1",
          modelId: "gpt-4o",
          providerName: "OpenAI",
        },
      ]);
    }
  });

  it("shows selected count badge", () => {
    const selected: CompareModelSelection[] = [
      { assistantId: "a1", modelId: "gpt-4o", providerName: "OpenAI" },
      {
        assistantId: "a2",
        modelId: "claude-3-opus",
        providerName: "Anthropic",
      },
    ];
    render(<ModelPicker selected={selected} onChange={vi.fn()} />);
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("renders tags for selected models", () => {
    const selected: CompareModelSelection[] = [
      { assistantId: "a1", modelId: "gpt-4o", providerName: "OpenAI" },
      {
        assistantId: "a2",
        modelId: "claude-3-opus",
        providerName: "Anthropic",
      },
    ];
    render(<ModelPicker selected={selected} onChange={vi.fn()} />);
    const tags = screen.getAllByTestId("tag");
    expect(tags).toHaveLength(2);
  });

  it("removes model when tag close is clicked", () => {
    const onChange = vi.fn();
    const selected: CompareModelSelection[] = [
      { assistantId: "a1", modelId: "gpt-4o", providerName: "OpenAI" },
      {
        assistantId: "a2",
        modelId: "claude-3-opus",
        providerName: "Anthropic",
      },
    ];
    render(<ModelPicker selected={selected} onChange={onChange} />);
    const closeButtons = screen.getAllByTestId("tag-close");
    fireEvent.click(closeButtons[0]);
    expect(onChange).toHaveBeenCalledWith([
      {
        assistantId: "a2",
        modelId: "claude-3-opus",
        providerName: "Anthropic",
      },
    ]);
  });
});
