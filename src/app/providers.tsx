"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, type ReactNode, Suspense, useEffect, useState } from "react";
import { createQueryClient } from "@/lib/query-client";
import { useSettingsStore } from "@/store/settings-store";
import type { ThemeMode } from "@/types/settings";

interface ProvidersProps {
  children: ReactNode;
}

type ResolvedTheme = "light" | "dark";

const ReactQueryDevtools = lazy(async () => {
  const module = await import("@tanstack/react-query-devtools");
  return { default: module.ReactQueryDevtools };
});

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "light" || mode === "dark") {
    return mode;
  }

  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());
  const themeMode = useSettingsStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (mode: ThemeMode) => {
      root.setAttribute("data-theme", resolveTheme(mode));
    };

    applyTheme(themeMode);

    if (themeMode !== "system") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyTheme("system");
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [themeMode]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV !== "production" ? (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      ) : null}
    </QueryClientProvider>
  );
}
