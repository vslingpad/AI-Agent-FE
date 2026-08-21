import {
  AlertTriangleIcon,
  ChevronRightIcon,
  CreditCardIcon,
  FileWarningIcon,
  LinkIcon,
  TrendingUpIcon,
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/ai-quality-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NeedsAttentionItem } from "@/lib/schemas/dashboard";
import { cn } from "@/lib/utils";

const attentionIcons = {
  "knowledge-gap": FileWarningIcon,
  conflict: AlertTriangleIcon,
  agent: CreditCardIcon,
  integration: LinkIcon,
  usage: TrendingUpIcon,
};

type NeedsAttentionListProps = {
  items: NeedsAttentionItem[];
};

export function NeedsAttentionList({ items }: NeedsAttentionListProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Needs attention</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col divide-y divide-border p-0 px-5 pb-2">
        {items.map((item) => {
          const Icon = attentionIcons[item.icon];

          return (
            <button
              key={item.id}
              type="button"
              className="flex w-full items-center gap-3 py-4 text-left transition-colors hover:bg-muted/40 first:pt-0"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {item.statusLabel && item.status ? (
                  <StatusBadge label={item.statusLabel} status={item.status} />
                ) : item.metricValue ? (
                  <span
                    className={cn(
                      "text-sm font-medium tabular-nums",
                      item.metricDirection === "down" && "text-red-500"
                    )}
                  >
                    {item.metricValue}
                  </span>
                ) : null}
                <ChevronRightIcon className="size-4 text-muted-foreground" />
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function NeedsAttentionListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs attention</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-14 animate-pulse rounded bg-muted" />
        ))}
      </CardContent>
    </Card>
  );
}
