/**
 * Next.js Image Component Mock
 *
 * 提供 Next.js Image 组件的 Mock 实现
 */

import type React from "react";

export interface MockImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
}

/**
 * Mock Next.js Image 组件
 * 在测试环境中渲染为普通 img 标签
 */
export const MockNextImage = ({ src, alt, ...props }: MockImageProps) => {
  // biome-ignore lint/performance/noImgElement: Mock 组件用于测试环境
  return <img src={src} alt={alt} {...props} />;
};
