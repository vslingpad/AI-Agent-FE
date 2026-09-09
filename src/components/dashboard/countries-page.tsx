"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import {
  DashboardPeriodToggle,
  DashboardSubpageError,
  DashboardSubpageHeader,
} from "@/components/dashboard/dashboard-subpage-header";
import { TrendIndicator } from "@/components/dashboard/trend-indicator";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDashboardCountries } from "@/hooks/use-dashboard";
import {
  ChartPeriodSchema,
  CountrySortBySchema,
  DASHBOARD_PAGE_SIZE_OPTIONS,
  SortDirectionSchema,
  type ChartPeriod,
  type CountrySortBy,
  type DashboardCountriesQuery,
  type SortDirection,
} from "@/lib/schemas/dashboard";
import { cn } from "@/lib/utils";

function parseQuery(searchParams: URLSearchParams): DashboardCountriesQuery {
  const period = ChartPeriodSchema.safeParse(searchParams.get("period") ?? "30d");
  const sortBy = CountrySortBySchema.safeParse(
    searchParams.get("sortBy") ?? "tickets"
  );
  const sortDir = SortDirectionSchema.safeParse(
    searchParams.get("sortDir") ?? "desc"
  );
  const pageParam = Number(searchParams.get("page"));
  const pageSizeParam = Number(searchParams.get("pageSize"));

  return {
    period: period.success ? period.data : "30d",
    query: searchParams.get("query") ?? undefined,
    sortBy: sortBy.success ? sortBy.data : "tickets",
    sortDir: sortDir.success ? sortDir.data : "desc",
    page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
    pageSize: DASHBOARD_PAGE_SIZE_OPTIONS.includes(
      pageSizeParam as (typeof DASHBOARD_PAGE_SIZE_OPTIONS)[number]
    )
      ? pageSizeParam
      : 20,
  };
}

function toSearchParams(query: DashboardCountriesQuery) {
  const params = new URLSearchParams();

  if (query.period && query.period !== "30d") {
    params.set("period", query.period);
  }

  if (query.query) {
    params.set("query", query.query);
  }

  if (query.sortBy && query.sortBy !== "tickets") {
    params.set("sortBy", query.sortBy);
  }

  if (query.sortDir && query.sortDir !== "desc") {
    params.set("sortDir", query.sortDir);
  }

  if (query.page > 1) {
    params.set("page", String(query.page));
  }

  if (query.pageSize !== 20) {
    params.set("pageSize", String(query.pageSize));
  }

  return params;
}

function SortButton({
  label,
  column,
  sortBy,
  sortDir,
  onSort,
  className,
}: {
  label: string;
  column: CountrySortBy;
  sortBy: CountrySortBy;
  sortDir: SortDirection;
  onSort: (column: CountrySortBy) => void;
  className?: string;
}) {
  const active = sortBy === column;

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={cn(
        "inline-flex items-center gap-1 font-medium hover:text-foreground",
        className
      )}
    >
      {label}
      {active ? (
        sortDir === "asc" ? (
          <ArrowUpIcon className="size-3" />
        ) : (
          <ArrowDownIcon className="size-3" />
        )
      ) : null}
    </button>
  );
}

export function CountriesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseQuery(searchParams), [searchParams]);
  const [searchValue, setSearchValue] = useState(query.query ?? "");
  const { data, isError, isFetching, refetch } = useDashboardCountries(query);

  const updateQuery = (next: DashboardCountriesQuery) => {
    const params = toSearchParams(next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  if (!data) {
    if (isError) {
      return (
        <DashboardSubpageError
          message="Unable to load country ticket data."
          onRetry={() => refetch()}
        />
      );
    }

    return <CountriesPageSkeleton />;
  }

  const maxShare = Math.max(...data.rows.map((row) => row.sharePercent), 1);
  const pageStart = (data.pagination.page - 1) * data.pagination.pageSize;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <DashboardSubpageHeader
        title="AI-handled tickets by country"
        description="Every country with AI-handled tickets in the selected period, including share of volume and change versus the comparison window."
        actions={
          <DashboardPeriodToggle
            value={query.period ?? "30d"}
            onChange={(period: ChartPeriod) =>
              updateQuery({ ...query, period, page: 1 })
            }
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">Countries</p>
            <p className="text-3xl font-semibold tabular-nums">{data.countryCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">AI-handled tickets</p>
            <p className="text-3xl font-semibold tabular-nums">{data.totalTickets}</p>
          </CardContent>
        </Card>
      </div>

      <Card className={cn("overflow-hidden py-0", isFetching && "opacity-70")}>
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Compared with {data.comparisonLabel}
          </p>
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
            placeholder="Search countries…"
            className="sm:max-w-64"
            aria-label="Search countries"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-left text-muted-foreground">
                <th className="px-5 py-3">
                  <SortButton
                    label="Country"
                    column="country"
                    sortBy={query.sortBy}
                    sortDir={query.sortDir}
                    onSort={(column) =>
                      updateQuery({
                        ...query,
                        sortBy: column,
                        sortDir:
                          query.sortBy === column && query.sortDir === "asc"
                            ? "desc"
                            : "asc",
                        page: 1,
                      })
                    }
                  />
                </th>
                <th className="px-5 py-3">
                  <SortButton
                    label="AI-handled tickets"
                    column="tickets"
                    sortBy={query.sortBy}
                    sortDir={query.sortDir}
                    onSort={(column) =>
                      updateQuery({
                        ...query,
                        sortBy: column,
                        sortDir:
                          query.sortBy === column && query.sortDir === "desc"
                            ? "asc"
                            : "desc",
                        page: 1,
                      })
                    }
                  />
                </th>
                <th className="px-5 py-3 font-medium">Share</th>
                <th className="px-5 py-3">
                  <SortButton
                    label={`vs ${data.comparisonLabel}`}
                    column="changePercent"
                    sortBy={query.sortBy}
                    sortDir={query.sortDir}
                    onSort={(column) =>
                      updateQuery({
                        ...query,
                        sortBy: column,
                        sortDir:
                          query.sortBy === column && query.sortDir === "desc"
                            ? "asc"
                            : "desc",
                        page: 1,
                      })
                    }
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
                  >
                    No countries match this search.
                  </td>
                </tr>
              ) : (
                data.rows.map((row) => (
                  <tr key={row.country} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3 font-medium">{row.country}</td>
                    <td className="px-5 py-3 tabular-nums">{row.tickets}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-foreground"
                            style={{
                              width: `${(row.sharePercent / maxShare) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="tabular-nums text-muted-foreground">
                          {row.sharePercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <TrendIndicator
                        change={row.changePercent}
                        label=""
                        direction={row.direction}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

export function CountriesPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Card>
        <CardContent className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
