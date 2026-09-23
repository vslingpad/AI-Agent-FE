import { getPlanDefinition, type BillingPlanTier } from "@/lib/billing/plans";
import { buildMonthlyConversationUsage } from "@/lib/billing/monthly-usage";
import type {
  BillingOverview,
  BillingSettings,
  UpdateBillingSettingsInput,
} from "@/lib/schemas/billing";

type StoredBillingState = {
  tier: BillingPlanTier;
  settings: BillingSettings;
  usage: BillingOverview["usage"];
  limits: BillingOverview["limits"];
};

const billingStateByOrg = new Map<string, StoredBillingState>();

function defaultBillingState(): StoredBillingState {
  const tier: BillingPlanTier = "growth";
  const plan = getPlanDefinition(tier);
  const conversationsUsed = 412;
  const conversationsIncluded = plan.includedConversations;
  const overageUsed = 12;

  return {
    tier,
    settings: {
      allowOverage: true,
      alertThresholds: [0.8, 1.0],
    },
    usage: {
      conversationsUsed,
      conversationsIncluded,
      freeRolloverRemaining: 0,
      overageUsed,
      overageCap: plan.maxOverage,
      additionalConversationCost: plan.additionalConversationCost,
      estimatedOverageCost: overageUsed * (plan.additionalConversationCost ?? 0),
      usagePercent: Math.round((conversationsUsed / conversationsIncluded) * 100),
      resetsAt: "2026-09-01T00:00:00.000Z",
      canAnswer: true,
      blockedReason: null,
    },
    limits: {
      agents: { used: 3, limit: plan.agentLimit },
      integrations: { used: 4, limit: plan.integrationLimit },
    },
  };
}

function getOrCreateBillingState(orgId: string) {
  const existing = billingStateByOrg.get(orgId);

  if (existing) {
    return existing;
  }

  const created = defaultBillingState();
  billingStateByOrg.set(orgId, created);
  return created;
}

export function getBillingOverview(orgId: string): BillingOverview {
  const state = getOrCreateBillingState(orgId);
  const plan = getPlanDefinition(state.tier);
  const includedUsed = Math.max(state.usage.conversationsUsed - state.usage.overageUsed, 0);

  return {
    subscription: {
      tier: state.tier,
      planName: plan.name,
      status: state.tier === "free" ? "none" : "active",
      monthlyBaseLabel: plan.monthlyBaseLabel,
      hasActiveSubscription: state.tier !== "free",
      billingInterval: "month",
      currentPeriodEnd: state.usage.resetsAt,
    },
    usage: state.usage,
    limits: state.limits,
    settings: state.settings,
    monthlyUsage: {
      points: buildMonthlyConversationUsage(includedUsed, state.usage.overageUsed),
    },
  };
}

export function updateBillingSettings(orgId: string, input: UpdateBillingSettingsInput) {
  const state = getOrCreateBillingState(orgId);
  const plan = getPlanDefinition(state.tier);

  if (state.tier === "free") {
    throw new Error("Overage is not available on the Free plan.");
  }

  state.settings = {
    ...state.settings,
    allowOverage: input.allowOverage,
  };

  if (input.allowOverage) {
    state.usage = {
      ...state.usage,
      overageCap: plan.maxOverage,
    };
  }

  return getBillingOverview(orgId);
}

export function createBillingPortalSession(orgId: string) {
  getOrCreateBillingState(orgId);

  return {
    url: `https://billing.stripe.com/p/session/mock_${orgId}`,
  };
}
