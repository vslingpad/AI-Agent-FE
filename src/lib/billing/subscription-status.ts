import type { BillingOverview } from "@/lib/schemas/billing";

export type SubscriptionStatus = BillingOverview["subscription"]["status"];

export function canSelectSubscriptionPlan(subscription: {
  tier: BillingOverview["subscription"]["tier"];
  status: SubscriptionStatus;
}) {
  return subscription.tier === "free" || subscription.status === "canceled";
}

/** Sidebar org switcher and other compact plan labels from control-plane billing. */
export function formatOrgSwitcherPlanLabel(subscription: {
  tier: BillingOverview["subscription"]["tier"];
  status: SubscriptionStatus;
  planName: string;
}) {
  if (subscription.status === "canceled") {
    return "No Active Plan";
  }
  if (subscription.tier === "free") {
    return "Free";
  }
  return subscription.planName;
}

export function formatSubscriptionStatusLabel(status: SubscriptionStatus) {
  switch (status) {
    case "active":
      return "Active";
    case "trialing":
      return "Trialing";
    case "past_due":
      return "Past due";
    case "canceled":
      return "Canceled";
    default:
      return "Free";
  }
}

export function subscriptionStatusBadgeVariant(
  status: SubscriptionStatus
): "default" | "muted" | "warning" | "destructive" {
  switch (status) {
    case "past_due":
      return "warning";
    case "canceled":
      return "destructive";
    case "active":
    case "trialing":
      return "default";
    default:
      return "muted";
  }
}

export function subscriptionNeedsAttention(status: SubscriptionStatus) {
  return status === "past_due" || status === "canceled";
}

export function subscriptionStatusMessage(
  status: SubscriptionStatus,
  options?: { forMember?: boolean }
) {
  const forMember = options?.forMember ?? false;

  switch (status) {
    case "past_due":
      return forMember
        ? "Your organization's latest payment has failed. An admin needs to update the payment method."
        : "Your latest payment has failed. Update your payment method to continue this subscription.";
    case "canceled":
      return forMember
        ? "Your organization's subscription has ended. Please contact an admin to renew the subscription."
        : "Your subscription has ended. Renew your subscription to continue using the service.";
    default:
      return null;
  }
}
