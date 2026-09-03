"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  clampUsageRange,
  filterUsagePointsByRange,
  getDefaultUsageRange,
  type MonthRange,
} from "@/lib/billing/monthly-usage";
import type { MonthlyConversationUsagePoint } from "@/lib/schemas/billing";

const chartConfig = {
  included: {
    label: "Included",
    color: "#2B7FFF",
  },
  overage: {
    label: "Overage",
    color: "#8EC5FF",
  },
} satisfies ChartConfig;

type ConversationUsageChartProps = {
  points: MonthlyConversationUsagePoint[];
};

export function ConversationUsageChart({ points }: ConversationUsageChartProps) {
  const [range, setRange] = useState<MonthRange>(() => getDefaultUsageRange());

  const filteredPoints = useMemo(
    () => filterUsagePointsByRange(points, range),
    [points, range]
  );

  const totalConversations = filteredPoints.reduce((sum, point) => sum + point.total, 0);

  const handleRangeChange = (key: keyof MonthRange, value: string) => {
    if (!value) {
      return;
    }

    setRange((current) => clampUsageRange({ ...current, [key]: value }));
  };

  return (
    <Card className="border-border">
      <CardHeader className="gap-4 space-y-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle>Monthly conversation usage</CardTitle>
            <CardDescription>
              Billable AI-handled conversations by month, split between included and overage.
            </CardDescription>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row items-center">
            <MonthRangeField
              id="usage-range-start"
              value={range.start}
              onChange={(value) => handleRangeChange("start", value)}
            />
            <p className="text-sm font-medium">To</p>
            <MonthRangeField
              id="usage-range-end"
              value={range.end}
              onChange={(value) => handleRangeChange("end", value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredPoints.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            initialDimension={{ width: 720, height: 320 }}
            className="min-h-72 w-full aspect-auto"
          >
            <BarChart
              data={filteredPoints}
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
                    formatter={(value, name) => [
                      `${value} conversations`,
                      name === "included" ? "Included" : "Overage",
                    ]}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="included"
                stackId="usage"
                fill="var(--color-included)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="overage"
                stackId="usage"
                fill="var(--color-overage)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No conversation usage for the selected month range.
            </p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {totalConversations.toLocaleString()} billable conversations from{" "}
          {formatMonthLabel(range.start)} to {formatMonthLabel(range.end)}
          {filteredPoints.length > 0 ? ` (${filteredPoints.length} months)` : ""}.
        </p>
      </CardContent>
    </Card>
  );
}

function MonthRangeField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid w-full gap-2 sm:max-w-44">
      <Input
        id={id}
        type="month"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function formatMonthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(year, month - 1, 1);

  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}
