"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRightIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { ConversationUsageChart } from "@/components/billing/conversation-usage-chart";
import { UpgradePlansDialog } from "@/components/billing/upgrade-plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useBillingOverview,
  useBillingPortalSession,
  useUpdateBillingSettings,
} from "@/hooks/use-billing";
import { formatCurrency, formatLimitValue, isCheckoutPlanTier } from "@/lib/billing/plans";
import {
  canSelectSubscriptionPlan,
  formatSubscriptionStatusLabel,
  subscriptionStatusBadgeVariant,
  subscriptionStatusMessage,
} from "@/lib/billing/subscription-status";
import type { BillingOverview } from "@/lib/schemas/billing";
import { cn } from "@/lib/utils";

export function BillingPage() {
  return (
    <Show
      when={{ role: "org:admin" }}
      fallback={
        <AgentPageFrame
          title="Billing"
          description="Manage your subscription, usage, and plan limits."
        >
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm font-medium">Admin access required</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Only organization admins can view billing and subscription settings.
            </p>
          </div>
        </AgentPageFrame>
      }
    >
      <BillingPageContent />
    </Show>
  );
}

function BillingPageContent() {
  const { data, isLoading, isError, refetch } = useBillingOverview();
  const updateSettings = useUpdateBillingSettings();
  const portalSession = useBillingPortalSession();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const openUpgrade = useCallback(() => setUpgradeOpen(true), []);

  const openStripePortal = useCallback(async () => {
    try {
      const session = await portalSession.mutateAsync();
      window.open(session.url, "_blank", "noopener,noreferrer");
    } catch {
      // Mutation toast is shown globally.
    }
  }, [portalSession]);

  if (isLoading) {
    return <BillingPageSkeleton />;
  }

  if (isError || !data) {
    return (
      <AgentPageFrame
        title="Billing"
        description="Manage your subscription, usage, and plan limits."
      >
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">Unable to load billing details.</p>
          <Button variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      </AgentPageFrame>
    );
  }

  const handleOverageToggle = (allowOverage: boolean) => {
    void updateSettings.mutateAsync({ allowOverage });
  };

  const isFreePlan = data.subscription.tier === "free";
  const canSelectPlan = canSelectSubscriptionPlan(data.subscription);
  const hasActiveSubscription = data.subscription.hasActiveSubscription;

  return (
    <AgentPageFrame
      title="Billing"
      description="Review your plan, conversation usage, and overage settings."
      actions={
        <div className="flex flex-wrap gap-2">
          {!isFreePlan ? (
            <Button variant="outline" render={<Link href="/billing/invoices" />}>
              Invoices
            </Button>
          ) : null}
          {hasActiveSubscription ? (
            <>
              <Button
                variant="outline"
                disabled={portalSession.isPending}
                onClick={() => void openStripePortal()}
              >
                {portalSession.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : null}
                Manage billing
                {portalSession.isPending ? null : <ArrowUpRightIcon />}
              </Button>
              <Button onClick={openUpgrade}>Change plan</Button>
            </>
          ) : canSelectPlan ? (
            <Button onClick={openUpgrade}>
              {isFreePlan ? "Upgrade" : "Subscribe"}
              <ArrowUpRightIcon />
            </Button>
          ) : (
            <Button
              disabled={portalSession.isPending}
              onClick={() => void openStripePortal()}
            >
              {portalSession.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              Manage billing
              {portalSession.isPending ? null : <ArrowUpRightIcon />}
            </Button>
          )}
        </div>
      }
    >
      <Suspense fallback={null}>
        <CheckoutReturnHandler refetch={() => refetch()} />
        <UpgradeQueryHandler onOpen={openUpgrade} />
      </Suspense>
      <div className="flex max-w-5xl flex-col gap-6">
        <SubscriptionStatusAlert data={data} />
        <CurrentPlanSection data={data} />
        <UsageSection
          data={data}
          pending={updateSettings.isPending}
          onOverageToggle={(value) => void handleOverageToggle(value)}
          onUpgrade={openUpgrade}
        />
        <LimitsSection data={data} />
        <ConversationUsageChart points={data.monthlyUsage.points} />
      </div>
      <UpgradePlansDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        mode={hasActiveSubscription ? "change" : "checkout"}
        currentTier={
          hasActiveSubscription && isCheckoutPlanTier(data.subscription.tier)
            ? data.subscription.tier
            : null
        }
        currentBillingInterval={data.subscription.billingInterval}
      />
    </AgentPageFrame>
  );
}

function UpgradeQueryHandler({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("upgrade") !== "1") {
      return;
    }

    onOpen();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("upgrade");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [onOpen, pathname, router, searchParams]);

  return null;
}

function CheckoutReturnHandler({ refetch }: { refetch: () => Promise<unknown> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handled = useRef(false);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (!checkout || handled.current) {
      return;
    }

    handled.current = true;

    if (checkout === "success") {
      toast.success("Your plan has been upgraded successfully.");
      void refetch();
    }

    router.replace(pathname);
  }, [pathname, refetch, router, searchParams]);

  return null;
}

function SubscriptionStatusAlert({ data }: { data: BillingOverview }) {
  const { subscription } = data;
  const message = subscriptionStatusMessage(subscription.status);

  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border px-4 py-3",
        subscription.status === "past_due" && "border-amber-500/30 bg-amber-500/10",
        subscription.status === "canceled" && "border-destructive/30 bg-destructive/10"
      )}
    >
      <Badge variant={subscriptionStatusBadgeVariant(subscription.status)}>
        {formatSubscriptionStatusLabel(subscription.status)}
      </Badge>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function CurrentPlanSection({ data }: { data: BillingOverview }) {
  const { subscription } = data;
  const isFreePlan = subscription.tier === "free";

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle>{subscription.planName}</CardTitle>
            <CardDescription>
              {isFreePlan
                ? `${subscription.monthlyBaseLabel} · ${data.usage.conversationsIncluded} conversations`
                : subscription.status === "canceled"
                  ? `${subscription.monthlyBaseLabel} per month · Subscription ended`
                  : subscription.currentPeriodEnd
                    ? `${subscription.monthlyBaseLabel} per month · Renews on ${formatBillingDate(subscription.currentPeriodEnd)}`
                    : `${subscription.monthlyBaseLabel} per month`}
            </CardDescription>
          </div>
          <Badge variant={subscriptionStatusBadgeVariant(subscription.status)}>
            {formatSubscriptionStatusLabel(subscription.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <Metric label="Included conversations" value={String(data.usage.conversationsIncluded)} />
        <Metric
          label="Additional conversation cost"
          value={
            data.usage.additionalConversationCost === null
              ? "Not available"
              : formatCurrency(data.usage.additionalConversationCost)
          }
        />
        <Metric
          label="Max overage"
          value={
            data.usage.overageCap === null
              ? "Not available"
              : `${data.usage.overageCap} / period`
          }
        />
      </CardContent>
    </Card>
  );
}

function UsageSection({
  data,
  pending,
  onOverageToggle,
  onUpgrade,
}: {
  data: BillingOverview;
  pending: boolean;
  onOverageToggle: (allowOverage: boolean) => void;
  onUpgrade: () => void;
}) {
  const { usage, settings } = data;
  const isFreePlan = data.subscription.tier === "free";
  const isCanceled = data.subscription.status === "canceled";
  const includedAllowance = usage.conversationsIncluded + usage.freeRolloverRemaining;
  const includedProgress = Math.min((usage.conversationsUsed / includedAllowance) * 100, 100);
  const showOverage =
    usage.overageUsed > 0 || (settings.allowOverage && usage.overageCap !== null);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Conversation usage</CardTitle>
        <CardDescription>
          Billable AI-handled conversations for this billing period.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <UsageMeter
          label="Included usage"
          used={usage.conversationsUsed}
          limit={includedAllowance}
          progress={includedProgress}
          tone="default"
        />

        <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Allow overage beyond included credits</p>
            <p className="text-sm text-muted-foreground">
              {isFreePlan
                ? "Free plan does not support overage. Upgrade to a paid plan to enable it."
                : isCanceled
                  ? "Resubscribe to a paid plan before enabling overage."
                  : `Maximum overage matches your plan included quota (${usage.overageCap ?? 0} conversations).`}
            </p>
          </div>
          <Switch
            checked={settings.allowOverage}
            disabled={pending || isFreePlan || isCanceled}
            onCheckedChange={onOverageToggle}
            aria-label="Allow overage beyond included credits"
          />
        </div>

        {showOverage ? (
          <UsageMeter
            label="Overage"
            used={usage.overageUsed}
            limit={usage.overageCap ?? 0}
            progress={
              usage.overageCap
                ? Math.min((usage.overageUsed / usage.overageCap) * 100, 100)
                : 0
            }
            tone="warning"
            footer={
              usage.estimatedOverageCost > 0
                ? `Estimated overage this period: ${formatCurrency(usage.estimatedOverageCost)} (charged on next invoice)`
                : "Overage is charged on your next invoice with the plan fee."
            }
          />
        ) : null}

        {isFreePlan || data.subscription.status === "canceled" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {isFreePlan
                ? `${usage.usagePercent}% of included credits used`
                : "Renew your subscription to keep using the service."}
            </p>
            <Button className="py-1" onClick={onUpgrade}>
              {isFreePlan ? "Upgrade" : "Subscribe"}
              <ArrowUpRightIcon />
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {usage.resetsAt
              ? `Resets on ${formatBillingDate(usage.resetsAt)} · ${usage.usagePercent}% of included credits used`
              : `${usage.usagePercent}% of included credits used`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function LimitsSection({ data }: { data: BillingOverview }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Plan limits</CardTitle>
        <CardDescription>Resource usage included with your current plan.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <LimitMeter
          label="AI agents"
          used={data.limits.agents.used}
          limit={data.limits.agents.limit}
        />
        <LimitMeter
          label="Integrations"
          used={data.limits.integrations.used}
          limit={data.limits.integrations.limit}
        />
      </CardContent>
    </Card>
  );
}

function UsageMeter({
  label,
  used,
  limit,
  progress,
  tone,
  footer,
}: {
  label: string;
  used: number;
  limit: number;
  progress: number;
  tone: "default" | "warning";
  footer?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className={tone === "warning" ? "text-indigo-500" : undefined}>{label}</span>
        <span className={cn("tabular-nums", tone === "warning" && "font-medium text-indigo-500")}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "warning" ? "bg-indigo-500" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      {footer ? <p className="text-sm text-muted-foreground">{footer}</p> : null}
    </div>
  );
}

function LimitMeter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const limitLabel = formatLimitValue(limit);
  const progress =
    limit === null ? 35 : limit === 0 ? 0 : Math.min((used / limit) * 100, 100);

  return (
    <div className="space-y-2 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums">
          {used} / {limitLabel}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function BillingPageSkeleton() {
  return (
    <AgentPageFrame
      title="Billing"
      description="Manage your subscription, usage, and plan limits."
    >
      <div className="flex max-w-5xl flex-col gap-6">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </AgentPageFrame>
  );
}

function formatBillingDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

