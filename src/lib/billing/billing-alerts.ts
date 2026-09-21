import {
  canSelectSubscriptionPlan,
  subscriptionNeedsAttention,
  subscriptionStatusMessage,
} from "@/lib/billing/subscription-status";
import type { BillingOverview } from "@/lib/schemas/billing";

const DEFAULT_ALERT_THRESHOLDS = [0.8];

export type BillingSubscriptionAlert = {
  kind: "subscription";
  message: string;
};

export type BillingUsageAlertAdmin = {
  kind: "usage";
  lead: string;
  cta: string;
  href: string;
  tail: string;
};

export type BillingUsageAlertMember = {
  kind: "usage";
  message: string;
};

export type BillingNotificationAlert =
  | BillingSubscriptionAlert
  | BillingUsageAlertAdmin
  | BillingUsageAlertMember;

export function getBillingNotificationAlert(
  data: BillingOverview | undefined,
  isAdmin: boolean
): BillingNotificationAlert | null {
  if (!data) {
    return null;
  }

  if (subscriptionNeedsAttention(data.subscription.status)) {
    const message = subscriptionStatusMessage(data.subscription.status, {
      forMember: !isAdmin,
    });
    if (message) {
      return { kind: "subscription", message };
    }
  }

  const usage = buildUsageAlert(data);
  if (!usage) {
    return null;
  }

  if (isAdmin) {
    return {
      kind: "usage",
      lead: usage.lead,
      cta: usage.cta,
      href: usage.href,
      tail: usage.tail,
    };
  }

  return { kind: "usage", message: usage.memberMessage };
}

/** Sidebar tooltip / member copy when any billing alert applies. */
export function getBillingAlertPlainMessage(
  data: BillingOverview | undefined,
  isAdmin: boolean
): string | null {
  const alert = getBillingNotificationAlert(data, isAdmin);
  if (!alert) {
    return null;
  }

  if (alert.kind === "subscription") {
    return alert.message;
  }

  if ("message" in alert) {
    return alert.message;
  }

  return `${alert.lead} ${alert.tail}`.replace(/\s+/g, " ").trim();
}

export function subscriptionAlertDismissible(
  data: BillingOverview | undefined,
  isAdmin: boolean
) {
  const alert = getBillingNotificationAlert(data, isAdmin);
  return alert?.kind !== "subscription";
}

function buildUsageAlert(data: BillingOverview) {
  const isFreePlan = data.subscription.tier === "free";
  const canSelectPlan = canSelectSubscriptionPlan(data.subscription);
  const thresholds = data.settings.alertThresholds.length
    ? data.settings.alertThresholds
    : DEFAULT_ALERT_THRESHOLDS;
  const warnAt = Math.min(...thresholds);
  const percent = Math.max(0, Math.round(data.usage.usagePercent));

  if (!data.usage.canAnswer) {
    return canSelectPlan
      ? {
          lead: isFreePlan
            ? "AI replies are paused. You've used all free conversations."
            : "AI replies are paused. Your subscription has ended.",
          cta: isFreePlan ? "Upgrade" : "Choose plan",
          href: "/billing?upgrade=1",
          tail: isFreePlan
            ? "to continue answering customers."
            : "to subscribe again.",
          memberMessage: isFreePlan
            ? "AI replies are paused. Your organization has used all free conversations."
            : "AI replies are paused. Your organization's subscription has ended.",
        }
      : {
          lead: "AI replies are paused. Included conversations are used up.",
          cta: "Review billing",
          href: "/billing",
          tail: "to enable overage or change your plan.",
          memberMessage:
            "AI replies are paused. Included conversations are used up. Ask an organization admin to review billing.",
        };
  }

  if (percent / 100 < warnAt) {
    return null;
  }

  if (isFreePlan) {
    const memberMessage =
      percent >= 100
        ? "Your organization has used all 50 free conversations."
        : `Your organization's free conversation usage is at ${percent}%.`;
    return {
      lead:
        percent >= 100
          ? "You've used all 50 free conversations."
          : `Your free conversation usage is at ${percent}%.`,
      cta: "Upgrade your plan",
      href: "/billing?upgrade=1",
      tail: "to keep Agent replies running.",
      memberMessage,
    };
  }

  if (percent >= 100) {
    return {
      lead: `You've used ${percent}% of your included conversations.`,
      cta: "Review billing",
      href: "/billing",
      tail: "to enable overage or avoid interruption.",
      memberMessage: `Your organization has used ${percent}% of included conversations.`,
    };
  }

  return {
    lead: `Your conversation usage is at ${percent}%.`,
    cta: "Review billing",
    href: "/billing",
    tail: "to avoid overage charges.",
    memberMessage: `Your organization's conversation usage is at ${percent}%.`,
  };
}
