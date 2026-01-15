import { act, fireEvent, render, screen } from "@testing-library/react";
import type { KeyboardEvent, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { MessageInput } from "./MessageInput";

interface MockSenderProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (message: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => undefined | false;
  disabled?: boolean;
  footer?: ReactNode;
}

vi.mock("@ant-design/x", () => ({
  Sender: ({
    value,
    onChange,
    onSubmit,
    onKeyDown,
    disabled,
    footer,
  }: MockSenderProps) => (
    <div>
      <textarea
        data-testid="sender-input"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
      <button
        type="button"
        data-testid="sender-submit"
        onClick={() => onSubmit?.(value ?? "")}
      >
        Send
      </button>
      {footer ? <div data-testid="sender-footer">{footer}</div> : null}
    </div>
  ),
}));

describe("MessageInput", () => {
  it("sends on ctrl+enter", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    const onChange = vi.fn();

    render(<MessageInput value="hello" onChange={onChange} onSend={onSend} />);

    const input = screen.getByTestId("sender-input");

    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter", ctrlKey: true });
    });

    expect(onSend).toHaveBeenCalledWith("hello");
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("does not send empty content", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    const onChange = vi.fn();

    render(<MessageInput value="   " onChange={onChange} onSend={onSend} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("sender-submit"));
    });

    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByText("消息不能为空")).toBeTruthy();
  });

  it("sends on submit button", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    const onChange = vi.fn();

    render(
      <MessageInput value="send me" onChange={onChange} onSend={onSend} />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("sender-submit"));
    });

    expect(onSend).toHaveBeenCalledWith("send me");
    expect(onChange).toHaveBeenCalledWith("");
  });
});
