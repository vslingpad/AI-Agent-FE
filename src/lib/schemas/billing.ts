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

export const BillingIntervalSchema = z.enum(["month", "year"]);

export const BillingSubscriptionSchema = z.object({
  tier: BillingPlanTierSchema,
  planName: z.string(),
  status: BillingSubscriptionStatusSchema,
  monthlyBaseLabel: z.string(),
  hasActiveSubscription: z.boolean(),
  billingInterval: BillingIntervalSchema,
  currentPeriodEnd: z.string().nullable(),
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
  resetsAt: z.string().nullable(),
  canAnswer: z.boolean(),
  blockedReason: z.string().nullable(),
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

export const OrgInvoiceStatusSchema = z.enum([
  "pending",
  "synced",
  "failed",
  "skipped",
]);

export const OrgInvoiceSchema = z.object({
  stripeInvoiceId: z.string(),
  stripeInvoiceNumber: z.string().nullish(),
  zohoInvoiceId: z.string().nullish(),
  zohoInvoiceNumber: z.string().nullish(),
  status: OrgInvoiceStatusSchema.or(z.string()),
  amount: z.string(),
  currency: z.string(),
  paidAt: z.string().nullish(),
  syncedAt: z.string().nullish(),
  createdAt: z.string(),
});

export const OrgInvoiceListSchema = z.array(OrgInvoiceSchema);

export const CheckoutPlanTierSchema = z.enum(["starter", "growth", "scale"]);

export const CreateCheckoutSessionInputSchema = z.object({
  planTier: CheckoutPlanTierSchema,
  billingInterval: BillingIntervalSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const ChangePlanInputSchema = z.object({
  planTier: CheckoutPlanTierSchema,
  billingInterval: BillingIntervalSchema,
});

export type BillingOverview = z.infer<typeof BillingOverviewSchema>;
export type BillingSettings = z.infer<typeof BillingSettingsSchema>;
export type UpdateBillingSettingsInput = z.infer<typeof UpdateBillingSettingsInputSchema>;
export type MonthlyConversationUsagePoint = z.infer<typeof MonthlyConversationUsagePointSchema>;
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionInputSchema>;
export type ChangePlanInput = z.infer<typeof ChangePlanInputSchema>;
export type CheckoutPlanTier = z.infer<typeof CheckoutPlanTierSchema>;
export type BillingInterval = z.infer<typeof BillingIntervalSchema>;
export type OrgInvoice = z.infer<typeof OrgInvoiceSchema>;
