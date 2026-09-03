import { z } from "zod";
import { BILLING_PLAN_TIERS } from "@/lib/billing/plans";

export const BillingPlanTierSchema = z.enum(BILLING_PLAN_TIERS);

export const BillingSubscriptionStatusSchema = z.enum([
  "active",
  "trialing",
  "past_due",
  "canceled",
  "none",
]);

export const BillingSubscriptionSchema = z.object({
  tier: BillingPlanTierSchema,
  planName: z.string(),
  status: BillingSubscriptionStatusSchema,
  monthlyBaseLabel: z.string(),
  hasActiveSubscription: z.boolean(),
  currentPeriodEnd: z.string(),
});

export const BillingUsageSchema = z.object({
  conversationsUsed: z.number(),
  conversationsIncluded: z.number(),
  freeRolloverRemaining: z.number(),
  overageUsed: z.number(),
  overageCap: z.number().nullable(),
  additionalConversationCost: z.number().nullable(),
  estimatedOverageCost: z.number(),
  usagePercent: z.number(),
  resetsAt: z.string(),
});

export const BillingResourceLimitSchema = z.object({
  used: z.number(),
  limit: z.number().nullable(),
});

export const BillingLimitsSchema = z.object({
  agents: BillingResourceLimitSchema,
  integrations: BillingResourceLimitSchema,
});

export const BillingSettingsSchema = z.object({
  allowOverage: z.boolean(),
  alertThresholds: z.array(z.number()),
});

export const MonthlyConversationUsagePointSchema = z.object({
  month: z.string(),
  label: z.string(),
  included: z.number(),
  overage: z.number(),
  total: z.number(),
});

export const MonthlyConversationUsageSchema = z.object({
  points: z.array(MonthlyConversationUsagePointSchema),
});

export const BillingOverviewSchema = z.object({
  subscription: BillingSubscriptionSchema,
  usage: BillingUsageSchema,
  limits: BillingLimitsSchema,
  settings: BillingSettingsSchema,
  monthlyUsage: MonthlyConversationUsageSchema,
});

export const UpdateBillingSettingsInputSchema = z.object({
  allowOverage: z.boolean(),
});

export const BillingPortalSessionSchema = z.object({
  url: z.string().url(),
});

export type BillingOverview = z.infer<typeof BillingOverviewSchema>;
export type BillingSettings = z.infer<typeof BillingSettingsSchema>;
export type UpdateBillingSettingsInput = z.infer<typeof UpdateBillingSettingsInputSchema>;
export type MonthlyConversationUsagePoint = z.infer<typeof MonthlyConversationUsagePointSchema>;
