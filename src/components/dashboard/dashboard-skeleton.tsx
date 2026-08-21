import {
  AgentPerformanceTableSkeleton,
} from "@/components/dashboard/agent-performance-table";
import { AiQualityCardSkeleton } from "@/components/dashboard/ai-quality-card";
import { CountryTicketsTableSkeleton } from "@/components/dashboard/country-tickets-table";
import { KpiCardsSkeleton } from "@/components/dashboard/kpi-cards";
import { NeedsAttentionListSkeleton } from "@/components/dashboard/needs-attention-list";
import { RecentActivityListSkeleton } from "@/components/dashboard/recent-activity-list";
import { TicketsOverTimeChartSkeleton } from "@/components/dashboard/tickets-over-time-chart";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-2">
      <div className="space-y-2 pt-8">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <KpiCardsSkeleton />

      <div className="grid items-stretch gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TicketsOverTimeChartSkeleton />
        </div>
        <CountryTicketsTableSkeleton />
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AgentPerformanceTableSkeleton />
        </div>
        <AiQualityCardSkeleton />
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-2">
        <NeedsAttentionListSkeleton />
        <RecentActivityListSkeleton />
      </div>
    </div>
  );
}
