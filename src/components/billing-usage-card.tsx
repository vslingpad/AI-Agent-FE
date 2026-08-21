"use client";

import { InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type BillingUsageCardProps = {
  conversationsUsed?: number;
  conversationsLimit?: number;
  overageUsed?: number;
  overageLimit?: number;
  resetsOn?: string;
};

function BillingUsageDetails({
  conversationsUsed,
  conversationsLimit,
  overageUsed,
  overageLimit,
  resetsOn,
  hasOverage,
  className,
}: {
  conversationsUsed: number;
  conversationsLimit: number;
  overageUsed: number;
  overageLimit: number;
  resetsOn: string;
  hasOverage: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span>Conversations</span>
          <span className="tabular-nums">
            {conversationsUsed} / {conversationsLimit}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-sidebar-accent">
          <div
            className="h-full rounded-full bg-sidebar-primary"
            style={{
              width: `${Math.min((conversationsUsed / conversationsLimit) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {hasOverage ? (
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-destructive">Overage</span>
            <span className="font-medium tabular-nums text-destructive">
              {overageUsed} / {overageLimit}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-sidebar-accent">
            <div
              className="h-full rounded-full bg-destructive"
              style={{
                width: `${Math.min((overageUsed / overageLimit) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      <p className="text-xs text-sidebar-foreground/60">Renew on {resetsOn}</p>
    </div>
  );
}

export function BillingUsageCard({
  conversationsUsed = 412,
  conversationsLimit = 500,
  overageUsed = 127,
  overageLimit = 500,
  resetsOn = "Sep 1",
}: BillingUsageCardProps) {
  const { state } = useSidebar();
  const hasOverage = overageUsed > 0;
  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="mx-auto size-8 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              aria-label="View billing usage"
            >
              <InfoIcon />
            </Button>
          }
        />
        <TooltipContent
          side="right"
          align="center"
          hideArrow
          className="flex w-64 flex-col items-stretch gap-2 bg-popover p-3 text-left text-popover-foreground shadow-md ring-1 ring-foreground/10"
        >
          <p className="text-xs font-medium text-muted-foreground">
            Billing usage
          </p>
          <BillingUsageDetails
            conversationsUsed={conversationsUsed}
            conversationsLimit={conversationsLimit}
            overageUsed={overageUsed}
            overageLimit={overageLimit}
            resetsOn={resetsOn}
            hasOverage={hasOverage}
          />
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar p-3 text-sidebar-foreground">
      <p className="mb-3 text-xs font-medium text-sidebar-foreground/70">
        Billing usage
      </p>

      <BillingUsageDetails
        conversationsUsed={conversationsUsed}
        conversationsLimit={conversationsLimit}
        overageUsed={overageUsed}
        overageLimit={overageLimit}
        resetsOn={resetsOn}
        hasOverage={hasOverage}
      />
    </div>
  );
}
