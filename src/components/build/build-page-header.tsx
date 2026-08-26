"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, SearchIcon } from "lucide-react";
import { useBuildPageContext } from "@/components/build/build-page-context";
import { Input } from "@/components/ui/input";
import { resolveBuildBreadcrumbs } from "@/lib/navigation/build-sections";
import { cn } from "@/lib/utils";

export function BuildPageHeader() {
  const pathname = usePathname();
  const { shellConfig, meta, searchQuery, setSearchQuery } =
    useBuildPageContext();

  const breadcrumbs = meta.breadcrumbs ?? resolveBuildBreadcrumbs(pathname);
  const showSearch = meta.enableSearch ?? shellConfig.enableSearch ?? false;
  const searchPlaceholder =
    meta.searchPlaceholder ??
    shellConfig.searchPlaceholder ??
    "Search…";

  if (breadcrumbs.length === 0 && !showSearch) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
      )}
    >
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-6 py-3">
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex flex-wrap items-center gap-1 text-sm">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                  {index > 0 ? (
                    <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  ) : null}
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="truncate text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        "truncate",
                        isLast
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      )}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {showSearch ? (
          <div className="relative w-full sm:w-72 sm:shrink-0">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 pl-8"
              aria-label={searchPlaceholder}
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}
