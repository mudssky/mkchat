"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type MatchType = "exact" | "prefix";
type Orientation = "vertical" | "horizontal";

interface ModuleSubNavItem {
  label: string;
  href: string;
  icon?: string;
  match?: MatchType;
}

interface ModuleSubNavProps {
  items: ModuleSubNavItem[];
  orientation?: Orientation;
  className?: string;
}

function isActivePath(pathname: string, href: string, match: MatchType) {
  if (match === "exact") {
    return pathname === href;
  }
  return pathname.startsWith(href);
}

export function ModuleSubNav({
  items,
  orientation = "vertical",
  className,
}: ModuleSubNavProps) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className={cn(
        orientation === "vertical" ? "space-y-1" : "flex flex-wrap gap-2",
        className,
      )}
      aria-label="模块导航"
    >
      {items.map((item) => {
        const match = item.match ?? "prefix";
        const active = isActivePath(pathname, item.href, match);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50",
            )}
          >
            {item.icon ? <span className="text-base">{item.icon}</span> : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
