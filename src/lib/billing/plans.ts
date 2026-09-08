export const BILLING_PLAN_TIERS = [
  "free",
  "starter",
  "growth",
  "scale",
  "enterprise",
] as const;

export type BillingPlanTier = (typeof BILLING_PLAN_TIERS)[number];

export type PlanFeatureKey =
  | "analytics"
  | "autoRetrainAgents"
  | "detectContentGap"
  | "detectContentConflict"
  | "trainingPastTickets"
  | "trainOnMacros"
  | "trainingHelpCenter"
  | "helpdeskIntegration"
  | "aiActions"
  | "multilingual"
  | "whiteGloveSetup"
  | "dedicatedSuccessManager"
  | "monthlyAccountAudit";

export type PlanFeatureValue = boolean | string;

export type PlanDefinition = {
  tier: BillingPlanTier;
  name: string;
  monthlyBaseLabel: string;
  includedConversations: number;
  additionalConversationCost: number | null;
  maxOverage: number | null;
  agentLimit: number;
  integrationLimit: number | null;
  features: Record<PlanFeatureKey, PlanFeatureValue>;
};

export const PLAN_FEATURE_LABELS: Record<PlanFeatureKey, string> = {
  analytics: "Analytics",
  autoRetrainAgents: "Auto retrain agents",
  detectContentGap: "Detect content gap",
  detectContentConflict: "Detect content conflict",
  trainingPastTickets: "Training on past tickets",
  trainOnMacros: "Train on macros",
  trainingHelpCenter: "Training on Help Center",
  helpdeskIntegration: "Integrates with existing helpdesk",
  aiActions: "AI Actions",
  multilingual: "Multilingual",
  whiteGloveSetup: "White glove setup",
  dedicatedSuccessManager: "Dedicated success manager",
  monthlyAccountAudit: "Monthly account audit",
};

export const PLAN_DEFINITIONS: Record<BillingPlanTier, PlanDefinition> = {
  free: {
    tier: "free",
    name: "Free",
    monthlyBaseLabel: "$0",
    includedConversations: 50,
    additionalConversationCost: null,
    maxOverage: null,
    agentLimit: 1,
    integrationLimit: 2,
    features: {
      analytics: "Basic",
      autoRetrainAgents: false,
      detectContentGap: false,
      detectContentConflict: false,
      trainingPastTickets: false,
      trainOnMacros: false,
      trainingHelpCenter: true,
      helpdeskIntegration: true,
      aiActions: true,
      multilingual: true,
      whiteGloveSetup: false,
      dedicatedSuccessManager: false,
      monthlyAccountAudit: false,
    },
  },
  starter: {
    tier: "starter",
    name: "Starter",
    monthlyBaseLabel: "Contact sales",
    includedConversations: 250,
    additionalConversationCost: 0.2,
    maxOverage: 250,
    agentLimit: 3,
    integrationLimit: 5,
    features: {
      analytics: "Standard",
      autoRetrainAgents: false,
      detectContentGap: false,
      detectContentConflict: true,
      trainingPastTickets: false,
      trainOnMacros: true,
      trainingHelpCenter: true,
      helpdeskIntegration: true,
      aiActions: true,
      multilingual: true,
      whiteGloveSetup: true,
      dedicatedSuccessManager: false,
      monthlyAccountAudit: false,
    },
  },
  growth: {
    tier: "growth",
    name: "Growth",
    monthlyBaseLabel: "Contact sales",
    includedConversations: 1000,
    additionalConversationCost: 0.15,
    maxOverage: 1000,
    agentLimit: 5,
    integrationLimit: 10,
    features: {
      analytics: "Advanced",
      autoRetrainAgents: true,
      detectContentGap: true,
      detectContentConflict: true,
      trainingPastTickets: true,
      trainOnMacros: true,
      trainingHelpCenter: true,
      helpdeskIntegration: true,
      aiActions: true,
      multilingual: true,
      whiteGloveSetup: true,
      dedicatedSuccessManager: true,
      monthlyAccountAudit: false,
    },
  },
  scale: {
    tier: "scale",
    name: "Scale",
    monthlyBaseLabel: "Contact sales",
    includedConversations: 5000,
    additionalConversationCost: 0.1,
    maxOverage: 5000,
    agentLimit: 10,
    integrationLimit: null,
    features: {
      analytics: "Advanced",
      autoRetrainAgents: true,
      detectContentGap: true,
      detectContentConflict: true,
      trainingPastTickets: true,
      trainOnMacros: true,
      trainingHelpCenter: true,
      helpdeskIntegration: true,
      aiActions: true,
      multilingual: true,
      whiteGloveSetup: true,
      dedicatedSuccessManager: true,
      monthlyAccountAudit: true,
    },
  },
  enterprise: {
    tier: "enterprise",
    name: "Enterprise",
    monthlyBaseLabel: "Contact sales",
    includedConversations: 0,
    additionalConversationCost: null,
    maxOverage: null,
    agentLimit: 0,
    integrationLimit: null,
    features: {
      analytics: "Advanced",
      autoRetrainAgents: true,
      detectContentGap: true,
      detectContentConflict: true,
      trainingPastTickets: true,
      trainOnMacros: true,
      trainingHelpCenter: true,
      helpdeskIntegration: true,
      aiActions: true,
      multilingual: true,
      whiteGloveSetup: true,
      dedicatedSuccessManager: true,
      monthlyAccountAudit: true,
    },
  },
};

export const PUBLIC_PLAN_DEFINITIONS = BILLING_PLAN_TIERS.map(
  (tier) => PLAN_DEFINITIONS[tier]
);

export function getPlanDefinition(tier: BillingPlanTier) {
  return PLAN_DEFINITIONS[tier];
}

export function formatPlanFeatureValue(value: PlanFeatureValue) {
  if (value === false) {
    return null;
  }

  if (value === true) {
    return "Included";
  }

  return value;
}

export function getIncludedPlanFeatures(tier: BillingPlanTier) {
  const plan = getPlanDefinition(tier);

  return (Object.entries(plan.features) as [PlanFeatureKey, PlanFeatureValue][])
    .map(([key, value]) => {
      const formatted = formatPlanFeatureValue(value);

      if (!formatted) {
        return null;
      }

      return {
        key,
        label: PLAN_FEATURE_LABELS[key],
        value: formatted,
      };
    })
    .filter((feature): feature is NonNullable<typeof feature> => feature !== null);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatLimitValue(limit: number | null) {
  return limit === null ? "Unlimited" : String(limit);
}
