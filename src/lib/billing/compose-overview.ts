import { isPlainObject, keysToCamel } from "@/lib/api/control-plane";
import { includedUsageCount } from "@/lib/billing/included-usage";
import {
  BILLING_PLAN_TIERS,
  formatCurrency,
  type BillingPlanTier,
} from "@/lib/billing/plans";
import {
  BillingOverviewSchema,
  type BillingOverview,
} from "@/lib/schemas/billing";

type BillingSubscriptionStatus = BillingOverview["subscription"]["status"];

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  const camel = keysToCamel(value);
  return isPlainObject(camel) ? camel : null;
}

function asList(value: unknown): unknown[] {
  const camel = keysToCamel(value);
  return Array.isArray(camel) ? camel : [];
}

function isoDate(value: unknown, fallback = new Date().toISOString()) {
  return isoDateOrNull(value) ?? fallback;
}

function isoDateOrNull(value: unknown) {
  if (typeof value === "string" && value) {
    return value;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  return null;
}

function asBillingInterval(value: unknown): "month" | "year" {
  const raw = asString(value, "month").toLowerCase();
  return raw === "year" ? "year" : "month";
}

function asPlanTier(value: unknown): BillingPlanTier {
  const tier = asString(value, "free").toLowerCase();
  return (BILLING_PLAN_TIERS as readonly string[]).includes(tier)
    ? (tier as BillingPlanTier)
    : "free";
}

function mapSubscriptionStatus(
  tier: BillingPlanTier,
  status: string
): BillingSubscriptionStatus {
  if (tier === "free") {
    return "none";
  }

  if (status === "trialing") {
    return "trialing";
  }

  if (status === "past_due") {
    return "past_due";
  }

  if (status === "canceled" || status === "deleted" || status === "suspended") {
    return "canceled";
  }

  return "active";
}

function monthlyBaseLabel(
  plan: Record<string, unknown> | null,
  tier: BillingPlanTier
) {
  if (tier === "free") {
    return "$0";
  }

  const cents = plan ? asNumber(plan.monthlyAmountCents, Number.NaN) : Number.NaN;
  if (!Number.isFinite(cents)) {
    return "Contact sales";
  }

  return formatCurrency(cents / 100);
}

function monthLabel(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) {
    return month;
  }

  return new Date(year, monthNumber - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
}

function findPlan(plans: unknown[], tier: string) {
  return (
    plans
      .map((item) => asRecord(item))
      .find((item) => item && asString(item.tier) === tier) ?? null
  );
}

function chartPoints(
  usage: Record<string, unknown>,
  conversationsUsed: number,
  overageUsed: number
) {
  const rows = asList(usage.monthlyUsage);
  const points = rows.flatMap((item) => {
    const row = asRecord(item);
    if (!row) {
      return [];
    }

    const month = asString(row.month);
    if (!month) {
      return [];
    }

    const included = asNumber(row.included);
    const overage = asNumber(row.overage);
    const total = asNumber(row.total, included + overage);

    return [
      {
        month,
        label: monthLabel(month),
        included,
        overage,
        total,
      },
    ];
  });

  if (points.length > 0) {
    return points;
  }

  const resetAt = isoDate(usage.billingPeriodEnd ?? usage.billingPeriodStart);
  const date = new Date(resetAt);
  const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  const included = Math.max(conversationsUsed - overageUsed, 0);

  return [
    {
      month,
      label: monthLabel(month),
      included,
      overage: overageUsed,
      total: included + overageUsed,
    },
  ];
}

export function composeBillingOverview(
  usagePayload: unknown,
  plansPayload: unknown,
  agentsPayload: unknown,
  connectorsPayload: unknown
): BillingOverview {
  const usage = asRecord(usagePayload) ?? {};
  const plans = asList(plansPayload);
  const agentsRoot = asRecord(agentsPayload) ?? {};
  const connectorsRoot = isPlainObject(connectorsPayload) ? connectorsPayload : {};
  const agents = asList(agentsRoot.agents);
  const connectors = asList(connectorsRoot.connectors);

  const tier = asPlanTier(usage.planTier);
  const plan = findPlan(plans, tier);
  const overageSupported = asBoolean(usage.overageSupported);
  const planIncludedTotal = asNumber(usage.planIncludedTotal);
  const freeGrant = asNumber(plan?.freeGrant);
  const conversationsIncluded = planIncludedTotal > 0 ? planIncludedTotal : freeGrant;
  const billedThisPeriod = asNumber(usage.conversationsBilledThisPeriod);
  const conversationsUsed = includedUsageCount({
    tier,
    planIncludedTotal,
    planIncludedRemaining: asNumber(usage.planIncludedRemaining),
    freeGrant,
    freeRemaining: asNumber(usage.freeRemaining),
  });
  const overageUsed = asNumber(usage.overageUsed);
  const resetsAt =
    tier === "free" ? null : isoDateOrNull(usage.billingPeriodEnd ?? usage.billingPeriodStart);
  const renewsAt = isoDateOrNull(usage.subscriptionRenewsAt) ?? resetsAt;
  const usageRatio = usage.includedUsageRatio;
  const usagePercent =
    typeof usageRatio === "number" && Number.isFinite(usageRatio)
      ? Math.round(usageRatio * 100)
      : conversationsIncluded + asNumber(usage.freeRolloverRemaining) > 0
        ? Math.round(
            (conversationsUsed /
              (conversationsIncluded + asNumber(usage.freeRolloverRemaining))) *
              100
          )
        : 0;

  const agentLimitRaw = plan?.maxAgents;
  const connectorLimitRaw =
    plan?.maxConnectors ??
    asNumber(connectorsRoot.plan_limit, Number.NaN);

  return BillingOverviewSchema.parse({
    subscription: {
      tier,
      planName: asString(usage.planName, plan ? asString(plan.displayName, "Plan") : "Plan"),
      status: mapSubscriptionStatus(tier, asString(usage.status, "active")),
      monthlyBaseLabel: monthlyBaseLabel(plan, tier),
      hasActiveSubscription: asBoolean(usage.hasActiveSubscription, false),
      billingInterval: asBillingInterval(usage.billingInterval),
      currentPeriodEnd: renewsAt,
    },
    usage: {
      conversationsUsed,
      conversationsIncluded,
      freeRolloverRemaining: asNumber(usage.freeRolloverRemaining),
      overageUsed,
      overageCap: overageSupported ? asNumber(usage.overageCap) : null,
      additionalConversationCost: (() => {
        if (!overageSupported) {
          return null;
        }

        const rate = asNumber(plan?.overageRate, Number.NaN);
        return Number.isFinite(rate) ? rate : null;
      })(),
      estimatedOverageCost: asNumber(usage.estimatedOverageCost),
      usagePercent,
      resetsAt,
      canAnswer: asBoolean(usage.canAnswer, true),
      blockedReason: asString(usage.blockedReason) || null,
    },
    limits: {
      agents: {
        used: agents.length,
        limit:
          typeof agentLimitRaw === "number" && Number.isFinite(agentLimitRaw)
            ? agentLimitRaw
            : null,
      },
      integrations: {
        used: asNumber(connectorsRoot.connected_count, connectors.length),
        limit:
          typeof connectorLimitRaw === "number" && Number.isFinite(connectorLimitRaw)
            ? connectorLimitRaw
            : null,
      },
    },
    settings: {
      allowOverage: asBoolean(usage.allowOverage),
      alertThresholds: [0.8, 1.0],
    },
    monthlyUsage: {
      points: chartPoints(usage, billedThisPeriod, overageUsed),
    },
  });
}
