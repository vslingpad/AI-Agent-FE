"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AgentPerformanceTable } from "@/components/dashboard/agent-performance-table";
import { AiQualityCard } from "@/components/dashboard/ai-quality-card";
import { CountryTicketsTable } from "@/components/dashboard/country-tickets-table";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { NeedsAttentionList } from "@/components/dashboard/needs-attention-list";
import { RecentActivityList } from "@/components/dashboard/recent-activity-list";
import { TicketsOverTimeChart } from "@/components/dashboard/tickets-over-time-chart";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/use-dashboard";
import { exportDashboardToCsv } from "@/lib/dashboard/export-dashboard";
import {
  DEFAULT_DASHBOARD_PERIOD,
  dashboardHref,
  isCustomDashboardRange,
  parseDashboardScope,
  toDashboardSearchParams,
} from "@/lib/dashboard/query";
import type { ChartPeriod, DashboardQueryParams } from "@/lib/schemas/dashboard";

export function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseDashboardScope(searchParams), [searchParams]);
  const [isExporting, setIsExporting] = useState(false);
  const { data, isError, isFetching, refetch } = useDashboard(query);

  const updateQuery = (next: DashboardQueryParams) => {
    const params = toDashboardSearchParams(next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleExport = () => {
    if (!data) {
      return;
    }

    setIsExporting(true);

    try {
      exportDashboardToCsv(data);
    } finally {
      setIsExporting(false);
    }
  };

  if (!data) {
    if (isError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
          <p className="text-sm text-muted-foreground">
            Unable to load dashboard data.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      );
    }

    return <DashboardSkeleton />;
  }

  const selectedPeriod = isCustomDashboardRange(query)
    ? null
    : (query.period ?? DEFAULT_DASHBOARD_PERIOD);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-2">
      <DashboardHeader
        filters={data.filters}
        query={query}
        onFiltersChange={updateQuery}
        onExport={handleExport}
        isExporting={isExporting}
      />

      <KpiCards kpis={data.kpis} />

      <div className="grid items-stretch gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TicketsOverTimeChart
            data={data.ticketsOverTime}
            comparisonLabel={data.filters.comparisonLabel}
            selectedPeriod={selectedPeriod}
            onPeriodChange={(period: ChartPeriod) =>
              updateQuery({
                ...query,
                period,
                dateFrom: undefined,
                dateTo: undefined,
              })
            }
            isFetching={isFetching}
            className="h-full"
          />
        </div>
        <CountryTicketsTable
          rows={data.countryTickets}
          comparisonLabel={data.filters.comparisonLabel}
          href={dashboardHref("/countries", query)}
        />
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AgentPerformanceTable rows={data.agentPerformance} />
        </div>
        <AiQualityCard
          data={data.aiQuality}
          href={dashboardHref("/ai-quality", query)}
        />
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-2">
        <NeedsAttentionList items={data.needsAttention} />
        <RecentActivityList
          items={data.recentActivity}
          href={dashboardHref("/activity", query)}
        />
      </div>
    </div>
  );
}
