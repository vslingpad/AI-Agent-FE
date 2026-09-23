import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  BillingOverviewSchema,
  BillingPortalSessionSchema,
  ChangePlanInputSchema,
  CreateCheckoutSessionInputSchema,
  OrgInvoiceListResponseSchema,
  OrgInvoiceViewUrlSchema,
  UpdateBillingSettingsInputSchema,
  type BillingOverview,
  type ChangePlanInput,
  type CreateCheckoutSessionInput,
  type OrgInvoiceListResponse,
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

export async function getBillingInvoices(params?: {
  page?: number;
  pageSize?: number;
  paidFrom?: string;
  paidTo?: string;
}) {
  const json = await apiGet<unknown>("/api/billing/invoices", {
    page: params?.page !== undefined ? String(params.page) : undefined,
    pageSize: params?.pageSize !== undefined ? String(params.pageSize) : undefined,
    paidFrom: params?.paidFrom,
    paidTo: params?.paidTo,
  });
  return OrgInvoiceListResponseSchema.parse(json) as OrgInvoiceListResponse;
}

export async function getBillingInvoiceViewUrl(stripeInvoiceId: string) {
  const json = await apiGet<unknown>(
    `/api/billing/invoices/${encodeURIComponent(stripeInvoiceId)}/view-url`
  );
  return OrgInvoiceViewUrlSchema.parse(json);
}
