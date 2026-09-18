"use client";

import { ArrowUpRightIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatSubscriptionStatusLabel,
  subscriptionNeedsAttention,
  type SubscriptionStatus,
} from "@/lib/billing/subscription-status";

type BillingUsageCardProps = {
  conversationsUsed?: number;
  conversationsLimit?: number;
  overageUsed?: number;
  overageLimit?: number;
  resetsOn?: string;
  href?: string;
  isFreePlan?: boolean;
  upgradeHref?: string;
  planName?: string;
  subscriptionStatus?: SubscriptionStatus;
  isAdmin?: boolean;
  alertMessage?: string | null;
  onManageBilling?: () => void;
  manageBillingPending?: boolean;
};

function BillingUsageDetails({
  conversationsUsed,
  conversationsLimit,
  overageUsed,
  overageLimit,
  resetsOn,
  hasOverage,
  isFreePlan,
  upgradeHref,
  planName,
  subscriptionStatus,
  isAdmin,
  alertMessage,
  onManageBilling,
  manageBillingPending,
  className,
}: {
  conversationsUsed: number;
  conversationsLimit: number;
  overageUsed: number;
  overageLimit: number;
  resetsOn?: string;
  hasOverage: boolean;
  isFreePlan?: boolean;
  upgradeHref?: string;
  planName?: string;
  subscriptionStatus?: SubscriptionStatus;
  isAdmin?: boolean;
  alertMessage?: string | null;
  onManageBilling?: () => void;
  manageBillingPending?: boolean;
  className?: string;
}) {
  const needsAttention =
    subscriptionStatus !== undefined &&
    subscriptionNeedsAttention(subscriptionStatus);
  const showAlertIcon = Boolean(alertMessage) && !isAdmin;

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
            <span className="text-indigo-500">Overage</span>
            <span className="font-medium tabular-nums text-indigo-500">
              {overageUsed} / {overageLimit}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-sidebar-accent">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{
                width: `${Math.min((overageUsed / overageLimit) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="default">{planName ?? (isFreePlan ? "Free" : "Plan")}</Badge>
        </div>
        {showAlertIcon ? (
          <BillingAlertInfoIcon message={alertMessage!} />
        ) : isAdmin && isFreePlan ? (
          <Button
            size="xs"
            render={<Link href={upgradeHref ?? "/billing?upgrade=1"} />}
          >
            Upgrade
            <ArrowUpRightIcon />
          </Button>
        ) : isAdmin && needsAttention && onManageBilling ? (
          <Button
            variant="destructive"
            size="xs"
            disabled={manageBillingPending}
            onClick={onManageBilling}
          >
            {formatSubscriptionStatusLabel(subscriptionStatus!)}{" "}
            <ArrowUpRightIcon />
          </Button>
        ) : isAdmin && resetsOn ? (
          <p className="text-xs text-sidebar-foreground/60">Renews on {resetsOn}</p>
        ) : null}
      </div>
    </div>
  );
}

function BillingAlertInfoIcon({ message }: { message: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Billing alert"
          >
            <InfoIcon />
          </Button>
        }
      />
      <TooltipContent side="top" className="max-w-xs text-left">
        {message}
      </TooltipContent>
    </Tooltip>
  );
}

export function BillingUsageCard({
  conversationsUsed = 412,
  conversationsLimit = 500,
  overageUsed = 127,
  overageLimit = 500,
  resetsOn,
  href,
  isFreePlan = false,
  upgradeHref,
  planName,
  subscriptionStatus,
  isAdmin = true,
  alertMessage,
  onManageBilling,
  manageBillingPending,
}: BillingUsageCardProps) {
  const { state } = useSidebar();
  const hasOverage = overageUsed > 0;
  const isCollapsed = state === "collapsed";
  const memberAlertOnly = !isAdmin && Boolean(alertMessage);

  const details = (
    <BillingUsageDetails
      conversationsUsed={conversationsUsed}
      conversationsLimit={conversationsLimit}
      overageUsed={overageUsed}
      overageLimit={overageLimit}
      resetsOn={resetsOn}
      hasOverage={hasOverage}
      isFreePlan={isFreePlan}
      upgradeHref={upgradeHref}
      planName={planName}
      subscriptionStatus={subscriptionStatus}
      isAdmin={isAdmin}
      alertMessage={alertMessage}
      onManageBilling={onManageBilling}
      manageBillingPending={manageBillingPending}
    />
  );

  if (isCollapsed) {
    if (memberAlertOnly) {
      return (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="mx-auto size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label="Billing alert"
              >
                <InfoIcon />
              </Button>
            }
          />
          <TooltipContent side="right" align="center" className="max-w-xs text-left">
            {alertMessage}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="mx-auto size-8 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              aria-label="View billing usage"
              render={
                isAdmin && isFreePlan ? (
                  <Link href={upgradeHref ?? "/billing?upgrade=1"} />
                ) : isAdmin && href ? (
                  <Link href={href} />
                ) : undefined
              }
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
          {details}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (href && isAdmin && !isFreePlan) {
    return (
      <Link
        href={href}
        className="block rounded-lg border border-sidebar-border bg-sidebar p-3 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
      >
        {details}
      </Link>
    );
  }

  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar p-3 text-sidebar-foreground">
      {details}
    </div>
  );
}
