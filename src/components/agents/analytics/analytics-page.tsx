"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Sparkline } from "@/components/dashboard/sparkline";
import { TrendIndicator } from "@/components/dashboard/trend-indicator";
import { DashboardDateFilter } from "@/components/dashboard/dashboard-filters";
import { DashboardPeriodToggle } from "@/components/dashboard/dashboard-subpage-header";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentAnalyticsSkeleton, AgentErrorState } from "@/components/agents/agent-states";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAgentAnalytics } from "@/hooks/use-agents";
import {
  DEFAULT_DASHBOARD_PERIOD,
  dashboardDateButtonLabel,
  isCustomDashboardRange,
  parseDashboardScope,
  toDashboardSearchParams,
} from "@/lib/dashboard/query";
import type { ChartPeriod, DashboardQueryParams } from "@/lib/schemas/dashboard";
import { cn } from "@/lib/utils";

const chartConfig = {
  value: {
    label: "Conversations",
    color: "var(--foreground)",
  },
} satisfies ChartConfig;

export function AgentAnalyticsPage({ agentId }: { agentId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseDashboardScope(searchParams), [searchParams]);
  const { data: analytics, isError, isFetching, refetch } = useAgentAnalytics(
    agentId,
    query
  );

  const updateQuery = (next: DashboardQueryParams) => {
    const params = toDashboardSearchParams(next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const selectedPeriod = isCustomDashboardRange(query)
    ? null
    : (query.period ?? DEFAULT_DASHBOARD_PERIOD);

  const rangeFilter = (
    <DashboardDateFilter
      query={query}
      label={dashboardDateButtonLabel(query, analytics?.dateRangeLabel)}
      onChange={updateQuery}
    />
  );

  if (!analytics) {
    if (isError) {
      return (
        <AgentErrorState message="Unable to load analytics." onRetry={() => refetch()} />
      );
    }

    return <AgentAnalyticsSkeleton />;
  }

  return (
    <AgentPageFrame
      title="Analytics"
      description="AI-handled conversations, resolution, and quality for this agent."
      actions={rangeFilter}
    >
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-3",
          isFetching && "opacity-70 transition-opacity"
        )}
      >
        {analytics.kpis.map((kpi) => (
          <Card key={kpi.id}>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <div className="flex items-end justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    {kpi.displayValue}
                  </p>
                  <TrendIndicator
                    change={kpi.change}
                    label={kpi.changeLabel}
                    direction={kpi.direction}
                    invertColors={kpi.invert}
                  />
                </div>
                <Sparkline
                  data={kpi.sparkline}
                  strokeClassName={
                    kpi.invert
                      ? kpi.direction === "down"
                        ? "stroke-emerald-500"
                        : "stroke-red-500"
                      : kpi.direction === "down"
                        ? "stroke-red-500"
                        : "stroke-emerald-500"
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div
        className={cn(
          "grid items-stretch gap-4 xl:grid-cols-3",
          isFetching && "opacity-70 transition-opacity"
        )}
      >
        <Card className="xl:col-span-2">
          <CardHeader className="items-center">
            <CardTitle>Conversations over time</CardTitle>
            <CardAction className="self-center">
              <DashboardPeriodToggle
                value={selectedPeriod}
                onChange={(period: ChartPeriod) =>
                  updateQuery({
                    ...query,
                    period,
                    dateFrom: undefined,
                    dateTo: undefined,
                  })
                }
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              initialDimension={{ width: 640, height: 240 }}
              className="aspect-auto h-60 w-full"
            >
              <LineChart data={analytics.ticketsOverTime} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <QualityRow
              label="Avg. confidence"
              value={
                analytics.avgConfidence > 0
                  ? `${Math.round(analytics.avgConfidence * 100)}%`
                  : "—"
              }
            />
            <QualityRow
              label="Knowledge-grounded"
              value={
                analytics.knowledgeGroundedRate > 0
                  ? `${analytics.knowledgeGroundedRate}%`
                  : "—"
              }
            />
            <QualityRow
              label="Credits remaining"
              value={`${analytics.remainingCredits.toLocaleString()} / ${analytics.includedCredits.toLocaleString()}`}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top topics</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.topTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Topics appear after this agent handles live conversations.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Topic</th>
                  <th className="pb-3 font-medium">Conversations</th>
                  <th className="pb-3 font-medium">Resolution</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topTopics.map((topic) => (
                  <tr key={topic.topic} className="border-b border-border/60 last:border-0">
                    <td className="py-3 font-medium">{topic.topic}</td>
                    <td className="py-3 tabular-nums">{topic.conversations}</td>
                    <td className="py-3 tabular-nums">{topic.resolutionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </AgentPageFrame>
  );
}

function QualityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
