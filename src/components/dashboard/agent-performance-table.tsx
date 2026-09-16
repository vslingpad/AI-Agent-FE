import Link from "next/link";
import {
  ArrowRightIcon,
  CreditCardIcon,
  HeadphonesIcon,
  WrenchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { agentPath } from "@/lib/navigation/agent-sections";
import type { AgentPerformanceRow } from "@/lib/schemas/dashboard";
import { cn } from "@/lib/utils";

const agentIcons = {
  support: HeadphonesIcon,
  billing: CreditCardIcon,
  technical: WrenchIcon,
};

function MetricCell({
  value,
  change,
  suffix = "%",
  invert = false,
}: {
  value: number;
  change: number;
  suffix?: string;
  invert?: boolean;
}) {
  const isUp = change > 0;
  const isDown = change < 0;
  const good = invert ? isDown : isUp;
  const bad = invert ? isUp : isDown;

  return (
    <div className="space-y-0.5">
      <p className="font-medium tabular-nums">
        {value}
        {suffix}
      </p>
      <p
        className={cn(
          "text-xs tabular-nums",
          good && "text-emerald-600",
          bad && "text-red-500",
          change === 0 && "text-muted-foreground"
        )}
      >
        {change > 0 ? "↑" : change < 0 ? "↓" : "·"} {Math.abs(change)}
        {suffix === "%" ? "%" : ""}
      </p>
    </div>
  );
}

type AgentPerformanceTableProps = {
  rows: AgentPerformanceRow[];
};

export function AgentPerformanceTable({ rows }: AgentPerformanceTableProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center">
        <CardTitle>AI agent performance</CardTitle>
        <CardAction className="self-center">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            render={<Link href="/agents" />}
          >
            View all agents
            <ArrowRightIcon className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Agent</th>
                <th className="pb-3 pr-4 font-medium">AI-handled tickets</th>
                <th className="pb-3 pr-4 font-medium">Resolution rate</th>
                <th className="pb-3 font-medium">Handoff rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const Icon = agentIcons[row.icon];

                return (
                  <tr key={row.id} className="border-b border-border/60 last:border-0">
                    <td className="py-4 pr-4">
                      <Link
                        href={agentPath(row.id)}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                          <Icon className="size-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{row.name}</span>
                      </Link>
                    </td>
                    <td className="py-4 pr-4 tabular-nums">{row.tickets}</td>
                    <td className="py-4 pr-4">
                      <MetricCell value={row.resolutionRate} change={row.resolutionChange} />
                    </td>
                    <td className="py-4">
                      <MetricCell
                        value={row.handoffRate}
                        change={row.handoffChange}
                        invert
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function AgentPerformanceTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI agent performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </CardContent>
    </Card>
  );
}
