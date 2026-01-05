import React from "react";
import { vi } from "vitest";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // biome-ignore lint/performance/noImgElement: Mock 组件用于测试环境
    return React.createElement("img", { ...props, alt: props.alt ?? "" });
  },
}));

// Mock Next.js Link component
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) => React.createElement("a", { href, ...props }, children),
}));
