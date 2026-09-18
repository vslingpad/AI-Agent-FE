"use client";

import { useState, type ReactNode } from "react";
import { CheckIcon, Loader2Icon } from "lucide-react";
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
import { useCheckoutSession } from "@/hooks/use-billing";
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [pendingTier, setPendingTier] = useState<CheckoutPlanTier | null>(null);
  const checkout = useCheckoutSession();

  const handleCheckout = async (tier: CheckoutPlanTier) => {
    const origin = window.location.origin;
    setPendingTier(tier);

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
        if (checkout.isPending) {
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
              <DialogTitle>Choose a plan</DialogTitle>
              <DialogDescription>
                Unused free conversations roll into your first paid month.
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
              pending={checkout.isPending && pendingTier === tier}
              disabled={checkout.isPending}
              onCheckout={handleCheckout}
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
  pending,
  disabled,
  onCheckout,
}: {
  tier: BillingPlanTier;
  interval: BillingInterval;
  recommended: boolean;
  pending: boolean;
  disabled: boolean;
  onCheckout: (tier: CheckoutPlanTier) => void;
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
        <Button className="mt-auto" disabled={disabled} onClick={() => onCheckout(tier)}>
          {pending ? <Loader2Icon className="size-4 animate-spin" /> : null}
          Upgrade to {plan.name}
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
