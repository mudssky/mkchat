import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FrameWidthPreset = "home" | "list" | "chat" | "settings";
type FrameDensity = "comfortable" | "compact";

interface PageFrameProps {
  children: ReactNode;
  widthPreset?: FrameWidthPreset;
  density?: FrameDensity;
  className?: string;
  containerClassName?: string;
}

const widthClassMap: Record<FrameWidthPreset, string> = {
  home: "max-w-5xl",
  list: "max-w-5xl",
  chat: "max-w-[800px]",
  settings: "max-w-6xl",
};

const densityClassMap: Record<FrameDensity, string> = {
  comfortable: "py-8",
  compact: "py-6",
};

export function PageFrame({
  children,
  widthPreset = "list",
  density = "compact",
  className,
  containerClassName,
}: PageFrameProps) {
  return (
    <main
      className={cn("flex-1 px-4 sm:px-6", densityClassMap[density], className)}
    >
      <div
        className={cn(
          "mx-auto w-full",
          widthClassMap[widthPreset],
          containerClassName,
        )}
      >
        {children}
      </div>
    </main>
  );
}
