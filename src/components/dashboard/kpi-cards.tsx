import { InfoIcon } from "lucide-react";
import { Sparkline } from "@/components/dashboard/sparkline";
import { TrendIndicator } from "@/components/dashboard/trend-indicator";
import { Card, CardContent } from "@/components/ui/card";
import type { KpiMetric } from "@/lib/schemas/dashboard";

type KpiCardsProps = {
  kpis: KpiMetric[];
};

function getSparklineColor(id: string, direction: KpiMetric["trend"]["direction"]) {
  if (id === "human-handoff-rate") {
    return direction === "down" ? "stroke-emerald-500" : "stroke-red-500";
  }

  return direction === "down" ? "stroke-red-500" : "stroke-emerald-500";
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {kpis.map((kpi) => (
        <Card key={kpi.id} className="h-full">
          <CardContent className="space-y-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>{kpi.label}</span>
              <InfoIcon className="size-3.5" />
            </div>

            <div className="flex items-end justify-between gap-3">
              <div className="space-y-1">
                <p className="text-3xl font-semibold tracking-tight tabular-nums">
                  {kpi.displayValue}
                </p>
                <TrendIndicator
                  change={kpi.trend.change}
                  label={kpi.trend.changeLabel}
                  direction={kpi.trend.direction}
                  invertColors={kpi.id === "human-handoff-rate"}
                />
              </div>

              <Sparkline
                data={kpi.trend.sparkline}
                strokeClassName={getSparklineColor(kpi.id, kpi.trend.direction)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-3">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-9 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
