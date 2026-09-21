"use client";

import { useOrganization } from "@clerk/nextjs";
import { BillingUsageCard } from "@/components/billing-usage-card";
import {
  useBillingOverview,
  useBillingPortalSession,
} from "@/hooks/use-billing";
import { getBillingAlertPlainMessage } from "@/lib/billing/billing-alerts";
import { canSelectSubscriptionPlan } from "@/lib/billing/subscription-status";

function BillingUsageCardConnected() {
  const { membership } = useOrganization();
  const isAdmin = membership?.role === "org:admin";
  const { data, isLoading } = useBillingOverview();
  const portalSession = useBillingPortalSession();

  const handleManageBilling = async () => {
    try {
      const session = await portalSession.mutateAsync();
      window.open(session.url, "_blank", "noopener,noreferrer");
    } catch {
      // Mutation toast is shown globally.
    }
  };

  if (isLoading || !data) {
    return <BillingUsageCard isLoading isAdmin={isAdmin} />;
  }

  const alertMessage = getBillingAlertPlainMessage(data, isAdmin);
  const canSelectPlan = canSelectSubscriptionPlan(data.subscription);

  return (
    <BillingUsageCard
      conversationsUsed={data.usage.conversationsUsed}
      conversationsLimit={
        data.usage.conversationsIncluded + data.usage.freeRolloverRemaining
      }
      overageUsed={data.settings.allowOverage ? data.usage.overageUsed : 0}
      overageLimit={data.usage.overageCap ?? 0}
      isFreePlan={data.subscription.tier === "free"}
      canSelectPlan={canSelectPlan}
      planName={data.subscription.planName}
      subscriptionStatus={data.subscription.status}
      isAdmin={isAdmin}
      alertMessage={alertMessage}
      onManageBilling={
        isAdmin && !canSelectPlan ? () => void handleManageBilling() : undefined
      }
      manageBillingPending={portalSession.isPending}
      upgradeHref="/billing?upgrade=1"
      resetsOn={
        canSelectPlan || !data.usage.resetsAt
          ? undefined
          : formatSidebarResetDate(data.usage.resetsAt)
      }
      href={isAdmin && !canSelectPlan ? "/billing" : undefined}
    />
  );
}

function formatSidebarResetDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function SidebarBillingUsageCard() {
  return <BillingUsageCardConnected />;
}
