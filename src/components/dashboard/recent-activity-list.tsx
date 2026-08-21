import {
  ArrowRightIcon,
  ClipboardListIcon,
  FileTextIcon,
  LightbulbIcon,
  LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentActivityItem } from "@/lib/schemas/dashboard";

const activityIcons = {
  document: FileTextIcon,
  lightbulb: LightbulbIcon,
  link: LinkIcon,
  clipboard: ClipboardListIcon,
};

type RecentActivityListProps = {
  items: RecentActivityItem[];
};

export function RecentActivityList({ items }: RecentActivityListProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-0 divide-y divide-border p-0 px-5 pb-2">
        {items.map((item) => {
          const Icon = activityIcons[item.icon];

          return (
            <div key={item.id} className="flex gap-3 py-4 first:pt-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>

              <p className="shrink-0 text-xs text-muted-foreground">{item.timestamp}</p>
            </div>
          );
        })}

        <div className="py-4">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            View all activity
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentActivityListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-14 animate-pulse rounded bg-muted" />
        ))}
      </CardContent>
    </Card>
  );
}
