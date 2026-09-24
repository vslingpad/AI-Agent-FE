"use client";

import { useState, type ReactNode } from "react";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChangePlan, useCheckoutSession } from "@/hooks/use-billing";
import {
  PLAN_DEFINITIONS,
  UPGRADE_PLAN_TIERS,
  formatCurrency,
  formatLimitValue,
  isCheckoutPlanTier,
  planPriceLabel,
  type BillingInterval,
  type BillingPlanTier,
} from "@/lib/billing/plans";
import { SUPPORT_EMAIL } from "@/lib/constants/support";
import type { CheckoutPlanTier } from "@/lib/schemas/billing";
import { cn } from "@/lib/utils";

const RECOMMENDED_TIER: CheckoutPlanTier = "growth";

export function UpgradePlansDialog({
  open,
  onOpenChange,
  mode = "checkout",
  currentTier,
  currentBillingInterval = "month",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "checkout" | "change";
  currentTier?: CheckoutPlanTier | null;
  currentBillingInterval?: BillingInterval;
}) {
  const [interval, setInterval] = useState<BillingInterval>(currentBillingInterval);
  const [pendingTier, setPendingTier] = useState<CheckoutPlanTier | null>(null);
  const checkout = useCheckoutSession();
  const changePlan = useChangePlan();
  const pending = checkout.isPending || changePlan.isPending;

  const [trackedInterval, setTrackedInterval] = useState({
    open,
    mode,
    currentBillingInterval,
  });
  if (
    open !== trackedInterval.open ||
    mode !== trackedInterval.mode ||
    currentBillingInterval !== trackedInterval.currentBillingInterval
  ) {
    setTrackedInterval({ open, mode, currentBillingInterval });
    if (open && mode === "change") {
      setInterval(currentBillingInterval);
    }
  }

  const handleSelectPlan = async (tier: CheckoutPlanTier) => {
    setPendingTier(tier);

    if (mode === "change") {
      try {
        await changePlan.mutateAsync({ planTier: tier, billingInterval: interval });
        toast.success("Your plan was updated.");
        onOpenChange(false);
      } catch {
        // Global mutation error toast.
      } finally {
        setPendingTier(null);
      }
      return;
    }

    const origin = window.location.origin;
    try {
      const session = await checkout.mutateAsync({
        planTier: tier,
        billingInterval: interval,
        successUrl: `${origin}/billing?checkout=success`,
        cancelUrl: `${origin}/billing?checkout=canceled`,
      });
      window.location.assign(session.url);
    } catch {
      setPendingTier(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) {
          return;
        }
        onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-h-[min(90vh,840px)] overflow-y-auto sm:max-w-6xl"
      >
        <DialogHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle>{mode === "change" ? "Change plan" : "Choose a plan"}</DialogTitle>
              <DialogDescription>
                {mode === "change"
                  ? "Proration is applied on your next Stripe invoice."
                  : "Unused free conversations roll into your first paid month."}
              </DialogDescription>
            </div>
            <Tabs
              value={interval}
              onValueChange={(value) => setInterval(value as BillingInterval)}
            >
              <TabsList>
                <TabsTrigger value="month">Monthly</TabsTrigger>
                <TabsTrigger value="year">Yearly · 2 months free</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {UPGRADE_PLAN_TIERS.map((tier) => (
            <PlanCard
              key={tier}
              tier={tier}
              interval={interval}
              recommended={tier === RECOMMENDED_TIER}
              mode={mode}
              isCurrent={
                mode === "change" &&
                currentTier === tier &&
                interval === currentBillingInterval
              }
              sameTierDifferentInterval={
                mode === "change" &&
                currentTier === tier &&
                interval !== currentBillingInterval
              }
              pending={pending && pendingTier === tier}
              disabled={pending}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlanCard({
  tier,
  interval,
  recommended,
  mode,
  isCurrent,
  sameTierDifferentInterval,
  pending,
  disabled,
  onSelectPlan,
}: {
  tier: BillingPlanTier;
  interval: BillingInterval;
  recommended: boolean;
  mode: "checkout" | "change";
  isCurrent: boolean;
  sameTierDifferentInterval: boolean;
  pending: boolean;
  disabled: boolean;
  onSelectPlan: (tier: CheckoutPlanTier) => void;
}) {
  const plan = PLAN_DEFINITIONS[tier];
  const selfServe = isCheckoutPlanTier(tier);
  const price = planPriceLabel(plan, interval);
  const priceSuffix =
    plan.monthlyAmountCents === null ? "" : interval === "year" ? " / year" : " / month";
  const conversationLabel =
    plan.includedConversations > 0
      ? `${plan.includedConversations.toLocaleString()} conversations / month`
      : "Custom conversation volume";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border p-4",
        recommended && "border-primary ring-1 ring-primary/20"
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-heading text-base font-medium">{plan.name}</p>
          {recommended ? <Badge>Recommended</Badge> : null}
        </div>
        <p className="text-2xl font-semibold tracking-tight">
          {price}
          {priceSuffix ? (
            <span className="text-sm font-normal text-muted-foreground">{priceSuffix}</span>
          ) : null}
        </p>
        {interval === "year" && plan.monthlyAmountCents !== null ? (
          <p className="text-xs text-muted-foreground">Billed annually · 2 months free</p>
        ) : null}
      </div>

      <ul className="space-y-2 text-sm">
        <PlanBullet>{conversationLabel}</PlanBullet>
        <PlanBullet>
          {plan.additionalConversationCost === null
            ? "Custom overage pricing"
            : `${formatCurrency(plan.additionalConversationCost)} per extra conversation`}
        </PlanBullet>
        <PlanBullet>
          {plan.agentLimit > 0 ? `${plan.agentLimit} AI agents` : "Unlimited AI agents"}
        </PlanBullet>
        <PlanBullet>
          {formatLimitValue(plan.integrationLimit)} integrations
        </PlanBullet>
      </ul>

      {selfServe ? (
        <Button
          className="mt-auto"
          disabled={disabled || isCurrent}
          variant={isCurrent ? "secondary" : "default"}
          onClick={() => onSelectPlan(tier)}
        >
          {pending ? <Loader2Icon className="size-4 animate-spin" /> : null}
          {isCurrent
            ? "Current plan"
            : sameTierDifferentInterval
              ? interval === "year"
                ? "Switch to yearly billing"
                : "Switch to monthly billing"
              : mode === "change"
                ? `Switch to ${plan.name}`
                : `Upgrade to ${plan.name}`}
        </Button>
      ) : (
        <Button
          className="mt-auto"
          variant="outline"
          render={
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Enterprise plan inquiry")}`}
            />
          }
        >
          Contact sales
        </Button>
      )}
    </div>
  );
}

function PlanBullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span>{children}</span>
    </li>
  );
}
