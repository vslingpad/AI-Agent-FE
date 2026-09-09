"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ACTIVITY_ICONS,
  ACTIVITY_ICON_LABELS,
} from "@/components/dashboard/activity-icons";
import {
  DashboardSubpageError,
  DashboardSubpageHeader,
} from "@/components/dashboard/dashboard-subpage-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDashboardActivity } from "@/hooks/use-dashboard";
import {
  ActivityIconSchema,
  DASHBOARD_PAGE_SIZE_OPTIONS,
  type ActivityIcon,
  type DashboardActivityQuery,
} from "@/lib/schemas/dashboard";
import { cn } from "@/lib/utils";

const FILTERS: { value: ActivityIcon | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "document", label: ACTIVITY_ICON_LABELS.document },
  { value: "lightbulb", label: ACTIVITY_ICON_LABELS.lightbulb },
  { value: "link", label: ACTIVITY_ICON_LABELS.link },
  { value: "clipboard", label: ACTIVITY_ICON_LABELS.clipboard },
];

function parseQuery(searchParams: URLSearchParams): DashboardActivityQuery {
  const icon = ActivityIconSchema.safeParse(searchParams.get("icon"));
  const pageParam = Number(searchParams.get("page"));
  const pageSizeParam = Number(searchParams.get("pageSize"));

  return {
    query: searchParams.get("query") ?? undefined,
    icon: icon.success ? icon.data : undefined,
    page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
    pageSize: DASHBOARD_PAGE_SIZE_OPTIONS.includes(
      pageSizeParam as (typeof DASHBOARD_PAGE_SIZE_OPTIONS)[number]
    )
      ? pageSizeParam
      : 20,
  };
}

function toSearchParams(query: DashboardActivityQuery) {
  const params = new URLSearchParams();

  if (query.query) {
    params.set("query", query.query);
  }

  if (query.icon) {
    params.set("icon", query.icon);
  }

  if (query.page > 1) {
    params.set("page", String(query.page));
  }

  if (query.pageSize !== 20) {
    params.set("pageSize", String(query.pageSize));
  }

  return params;
}

export function ActivityPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseQuery(searchParams), [searchParams]);
  const [searchValue, setSearchValue] = useState(query.query ?? "");
  const { data, isError, isFetching, refetch } = useDashboardActivity(query);

  const updateQuery = (next: DashboardActivityQuery) => {
    const params = toSearchParams(next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  if (!data) {
    if (isError) {
      return (
        <DashboardSubpageError
          message="Unable to load activity."
          onRetry={() => refetch()}
        />
      );
    }

    return <ActivityPageSkeleton />;
  }

  const pageStart = (data.pagination.page - 1) * data.pagination.pageSize;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <DashboardSubpageHeader
        title="Activity"
        description="Procedures, knowledge suggestions, integrations, and test runs across your agents."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((filter) => (
            <Button
              key={filter.label}
              size="sm"
              variant={query.icon === filter.value ? "secondary" : "ghost"}
              onClick={() =>
                updateQuery({ ...query, icon: filter.value, page: 1 })
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>
        <Input
          value={searchValue}
          onChange={(event) => {
            const value = event.target.value;
            setSearchValue(value);
            updateQuery({
              ...query,
              query: value.trim() || undefined,
              page: 1,
            });
          }}
          placeholder="Search activity…"
          className="sm:max-w-64"
          aria-label="Search activity"
        />
      </div>

      <Card className={cn("overflow-hidden py-0", isFetching && "opacity-70")}>
        {data.items.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No activity matches these filters.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {data.items.map((item) => {
              const Icon = ACTIVITY_ICONS[item.icon];

              return (
                <div key={item.id} className="flex gap-3 px-5 py-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {ACTIVITY_ICON_LABELS[item.icon]}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {item.timestamp}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        <TablePagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.totalItems}
          pageStart={pageStart}
          pageSize={data.pagination.pageSize}
          pageSizeOptions={DASHBOARD_PAGE_SIZE_OPTIONS}
          onPageChange={(page) => updateQuery({ ...query, page })}
          onPageSizeChange={(pageSize) =>
            updateQuery({ ...query, pageSize, page: 1 })
          }
        />
      </Card>
    </div>
  );
}

export function ActivityPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24" />
        ))}
      </div>
      <Card className="space-y-0 divide-y py-0">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="px-5 py-4">
            <Skeleton className="h-14 w-full" />
          </div>
        ))}
      </Card>
    </div>
  );
}
