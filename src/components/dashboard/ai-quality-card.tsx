import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { TrendIndicator } from "@/components/dashboard/trend-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AiQuality } from "@/lib/schemas/dashboard";
import { cn } from "@/lib/utils";

type AiQualityCardProps = {
  data: AiQuality;
};

export function AiQualityCard({ data }: AiQualityCardProps) {
  const { confidenceDistribution: dist } = data;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>AI quality</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-6">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm text-muted-foreground">Avg. answer confidence</p>
            <p className="text-3xl font-semibold tabular-nums">{data.avgConfidence}%</p>
          </div>

          <div className="flex h-2.5 overflow-hidden rounded-full">
            <div
              className="bg-emerald-500"
              style={{ width: `${dist.high}%` }}
              title={`High: ${dist.high}%`}
            />
            <div
              className="bg-amber-400"
              style={{ width: `${dist.medium}%` }}
              title={`Medium: ${dist.medium}%`}
            />
            <div
              className="bg-red-400"
              style={{ width: `${dist.low}%` }}
              title={`Low: ${dist.low}%`}
            />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>High (≥80%): {dist.high}%</span>
            <span>Medium (50–80%): {dist.medium}%</span>
            <span>Low (&lt;50%): {dist.low}%</span>
          </div>
        </div>

        <div className="space-y-1 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">Low-confidence answers</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold tabular-nums">
              {data.lowConfidenceRate}%
            </p>
            <TrendIndicator
              change={data.lowConfidenceChange}
              label=""
              direction={data.lowConfidenceDirection}
              invertColors
            />
          </div>
        </div>

        <div className="space-y-1 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">Knowledge-grounded answers</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold tabular-nums">
              {data.knowledgeGroundedRate}%
            </p>
            <TrendIndicator
              change={data.knowledgeGroundedChange}
              label=""
              direction={data.knowledgeGroundedDirection}
            />
          </div>
        </div>

        <Button
          variant="link"
          className="h-auto p-0 text-sm"
          render={<Link href="/ai-quality" />}
        >
          {data.lowConfidenceConversationCount} low-confidence conversations
          <ArrowRightIcon className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function AiQualityCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI quality</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-24 animate-pulse rounded bg-muted" />
        <div className="h-12 animate-pulse rounded bg-muted" />
        <div className="h-12 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

function StatusBadge({
  label,
  status,
}: {
  label: string;
  status: "warning" | "success" | "critical" | "default";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        status === "warning" && "bg-amber-100 text-amber-800",
        status === "success" && "bg-emerald-100 text-emerald-800",
        status === "critical" && "bg-red-100 text-red-800",
        status === "default" && "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

export { StatusBadge };
