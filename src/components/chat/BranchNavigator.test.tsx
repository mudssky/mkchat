import { fireEvent, render, screen } from "@testing-library/react";
import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { describe, expect, it, vi } from "vitest";
import { BranchNavigator } from "./BranchNavigator";

interface DropdownMenuClickInfo {
  key: string | number;
}

interface DropdownMenuProps {
  items?: Array<{ key?: string | number }>;
  onClick?: (info: DropdownMenuClickInfo) => void;
  selectedKeys?: string[];
}

interface DropdownProps {
  children?: ReactNode;
  menu?: DropdownMenuProps;
}

vi.mock("antd", () => ({
  Dropdown: ({ children, menu }: DropdownProps) => {
    const handleSelect = () => {
      menu?.onClick?.({
        key: menu.items?.[0]?.key ?? "",
      });
    };

    if (isValidElement(children)) {
      const child = children as ReactElement<{
        onClick?: (event: React.MouseEvent) => void;
        onKeyDown?: (event: React.KeyboardEvent) => void;
      }>;

      return cloneElement(child, {
        onClick: (event) => {
          child.props.onClick?.(event);
          handleSelect();
        },
        onKeyDown: (event) => {
          child.props.onKeyDown?.(event);
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleSelect();
          }
        },
      });
    }

    return (
      <button type="button" onClick={handleSelect}>
        {children}
      </button>
    );
  },
}));

const branches = [
  {
    id: "a",
    topicId: "t1",
    content: "first branch",
    role: "assistant" as const,
    createdAt: "2024-01-01T00:00:00Z",
    parentId: "root",
  },
  {
    id: "b",
    topicId: "t1",
    content: "second branch",
    role: "assistant" as const,
    createdAt: "2024-01-02T00:00:00Z",
    parentId: "root",
  },
];

describe("BranchNavigator", () => {
  it("renders branch count and handles selection", () => {
    const onSelectChild = vi.fn();

    render(
      <BranchNavigator
        parentMessageId="root"
        branches={branches}
        activeChildId="a"
        onSelectChild={onSelectChild}
      />,
    );

    expect(screen.getByText("分支 1 / 2")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Branch selector for root" }),
    );

    expect(onSelectChild).toHaveBeenCalledWith("a");
  });
});
