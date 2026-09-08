"use client";

import { useState } from "react";
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
import type { ChartPeriod } from "@/lib/schemas/dashboard";

export function DashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("30d");
  const [isExporting, setIsExporting] = useState(false);
  const { data, isError, isFetching, refetch } = useDashboard({
    period: chartPeriod,
  });

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

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-2">
      <DashboardHeader
        filters={data.filters}
        notificationCount={data.notificationCount}
        onExport={handleExport}
        isExporting={isExporting}
      />

      <KpiCards kpis={data.kpis} />

      <div className="grid items-stretch gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TicketsOverTimeChart
            data={data.ticketsOverTime}
            comparisonLabel={data.filters.comparisonLabel}
            selectedPeriod={chartPeriod}
            onPeriodChange={setChartPeriod}
            isFetching={isFetching}
            className="h-full"
          />
        </div>
        <CountryTicketsTable
          rows={data.countryTickets}
          comparisonLabel={data.filters.comparisonLabel}
        />
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AgentPerformanceTable rows={data.agentPerformance} />
        </div>
        <AiQualityCard data={data.aiQuality} />
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-2">
        <NeedsAttentionList items={data.needsAttention} />
        <RecentActivityList items={data.recentActivity} />
      </div>
    </div>
  );
}
