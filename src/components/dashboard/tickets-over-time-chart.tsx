"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { TrendIndicator } from "@/components/dashboard/trend-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ChartPeriod, DashboardData } from "@/lib/schemas/dashboard";
import { cn } from "@/lib/utils";

const periods: { value: ChartPeriod; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

const chartConfig = {
  value: {
    label: "AI-handled tickets",
    color: "var(--foreground)",
  },
} satisfies ChartConfig;

type TicketsOverTimeChartProps = {
  data: DashboardData["ticketsOverTime"];
  comparisonLabel: string;
  selectedPeriod: ChartPeriod | null;
  onPeriodChange: (period: ChartPeriod) => void;
  isFetching?: boolean;
  className?: string;
};

export function TicketsOverTimeChart({
  data,
  comparisonLabel,
  selectedPeriod,
  onPeriodChange,
  isFetching,
  className,
}: TicketsOverTimeChartProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col",
        isFetching && "opacity-70 transition-opacity",
        className
      )}
    >
      <CardHeader className="items-center">
        <CardTitle>AI-handled tickets over time</CardTitle>
        <CardAction className="self-center">
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "secondary" : "ghost"}
                size="xs"
                onClick={() => onPeriodChange(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-4">
        <ChartContainer
          config={chartConfig}
          initialDimension={{ width: 640, height: 256 }}
          className="min-h-64 flex-1 w-full aspect-auto"
        >
          <LineChart
            data={data.points}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [`${value} tickets`, "AI-handled"]}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-value)" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold tabular-nums">
            {data.summaryValue} tickets
          </span>
          <TrendIndicator
            change={data.summaryChange}
            label={`vs ${comparisonLabel}`}
            direction={data.summaryDirection}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function TicketsOverTimeChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-handled tickets over time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
