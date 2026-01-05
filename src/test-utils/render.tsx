/**
 * 自定义渲染函数
 *
 * 提供包装了必要 Provider 的自定义 render 函数
 */

import { render } from "@testing-library/react";
import type React from "react";

interface CustomRenderOptions {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

/**
 * 自定义 render 函数
 * 可以在这里添加全局 Provider (如 Theme, Query, etc.)
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: CustomRenderOptions,
) {
  const { wrapper: Wrapper } = options ?? {};

  // 如果需要，可以在这里添加默认的 Provider
  // const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  //   return (
  //     <ThemeProvider theme={theme}>
  //       <QueryClientProvider client={queryClient}>
  //         {children}
  //       </QueryClientProvider>
  //     </ThemeProvider>
  //   )
  // }

  return render(ui, {
    wrapper: Wrapper,
    ...options,
  });
}

// 重新导出所有 Testing Library 工具
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
