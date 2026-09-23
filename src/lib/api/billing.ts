import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  BillingOverviewSchema,
  BillingPortalSessionSchema,
  ChangePlanInputSchema,
  CreateCheckoutSessionInputSchema,
  OrgInvoiceListSchema,
  UpdateBillingSettingsInputSchema,
  type BillingOverview,
  type ChangePlanInput,
  type CreateCheckoutSessionInput,
  type OrgInvoice,
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

export async function changeSubscriptionPlan(input: ChangePlanInput) {
  const body = ChangePlanInputSchema.parse(input);
  const json = await apiPost<unknown>("/api/billing/change-plan", body);
  return BillingOverviewSchema.parse(json) as BillingOverview;
}

export async function getBillingInvoices() {
  const json = await apiGet<unknown>("/api/billing/invoices");
  return OrgInvoiceListSchema.parse(json) as OrgInvoice[];
}
