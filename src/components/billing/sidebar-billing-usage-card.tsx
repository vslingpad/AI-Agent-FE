"use client";

import { Show } from "@clerk/nextjs";
import { BillingUsageCard } from "@/components/billing-usage-card";
import { useBillingOverview } from "@/hooks/use-billing";

function BillingUsageCardConnected() {
  const { data, isLoading } = useBillingOverview();

  if (isLoading || !data) {
    return <BillingUsageCard />;
  }

  return (
    <BillingUsageCard
      conversationsUsed={data.usage.conversationsUsed}
      conversationsLimit={
        data.usage.conversationsIncluded + data.usage.freeRolloverRemaining
      }
      overageUsed={data.settings.allowOverage ? data.usage.overageUsed : 0}
      overageLimit={data.usage.overageCap ?? 0}
      isFreePlan={data.subscription.tier === "free"}
      planName={data.subscription.planName}
      upgradeHref="/billing?upgrade=1"
      resetsOn={
        data.subscription.tier === "free" || !data.usage.resetsAt
          ? undefined
          : formatSidebarResetDate(data.usage.resetsAt)
      }
      href={data.subscription.tier === "free" ? undefined : "/billing"}
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
  return (
    <Show when={{ role: "org:admin" }} fallback={<BillingUsageCard />}>
      <BillingUsageCardConnected />
    </Show>
  );
}
