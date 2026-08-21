"use client";

import { Line, LineChart } from "recharts";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

type SparklineProps = {
  data: number[];
  className?: string;
  strokeClassName?: string;
};

export function Sparkline({
  data,
  className,
  strokeClassName = "stroke-emerald-500",
}: SparklineProps) {
  if (data.length < 2) {
    return null;
  }

  const color =
    strokeClassName === "stroke-red-500"
      ? "hsl(0 84% 60%)"
      : "hsl(142 71% 45%)";

  const chartConfig = {
    value: {
      label: "Value",
      color,
    },
  } satisfies ChartConfig;

  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <ChartContainer
      config={chartConfig}
      initialDimension={{ width: 80, height: 48 }}
      className={cn("aspect-auto h-12 w-20 shrink-0", className)}
      aria-hidden
    >
      <LineChart
        data={chartData}
        margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
      >
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
