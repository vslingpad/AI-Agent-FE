import type { BillingPlanTier } from "@/lib/billing/plans";

/** Included conversations already spent. Overage is tracked separately. */
export function includedUsageCount({
  tier,
  planIncludedTotal,
  planIncludedRemaining,
  freeGrant,
  freeRemaining,
}: {
  tier: BillingPlanTier;
  planIncludedTotal: number;
  planIncludedRemaining: number;
  freeGrant: number;
  freeRemaining: number;
}) {
  const allowance = tier === "free" ? freeGrant : planIncludedTotal;
  const remaining = tier === "free" ? freeRemaining : planIncludedRemaining;
  return Math.max(0, allowance - remaining);
}
