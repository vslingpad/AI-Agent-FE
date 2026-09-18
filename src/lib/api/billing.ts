import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  BillingOverviewSchema,
  BillingPortalSessionSchema,
  CreateCheckoutSessionInputSchema,
  UpdateBillingSettingsInputSchema,
  type BillingOverview,
  type CreateCheckoutSessionInput,
  type UpdateBillingSettingsInput,
} from "@/lib/schemas/billing";

export async function getBillingOverview() {
  const json = await apiGet<unknown>("/api/billing");
  return BillingOverviewSchema.parse(json) as BillingOverview;
}

export async function updateBillingSettings(input: UpdateBillingSettingsInput) {
  const body = UpdateBillingSettingsInputSchema.parse(input);
  const json = await apiPatch<unknown>("/api/billing", body);
  return BillingOverviewSchema.parse(json) as BillingOverview;
}

export async function createBillingPortalSession() {
  const json = await apiPost<unknown>("/api/billing");
  return BillingPortalSessionSchema.parse(json);
}

export async function createCheckoutSession(input: CreateCheckoutSessionInput) {
  const body = CreateCheckoutSessionInputSchema.parse(input);
  const json = await apiPost<unknown>("/api/billing/checkout", body);
  return BillingPortalSessionSchema.parse(json);
}
