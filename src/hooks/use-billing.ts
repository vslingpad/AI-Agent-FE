"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@clerk/nextjs";
import {
  changeSubscriptionPlan,
  createBillingPortalSession,
  createCheckoutSession,
  getBillingInvoices,
  getBillingOverview,
  updateBillingSettings,
} from "@/lib/api/billing";
import type {
  ChangePlanInput,
  CreateCheckoutSessionInput,
  UpdateBillingSettingsInput,
} from "@/lib/schemas/billing";

function billingKey(orgId?: string) {
  return ["billing", orgId] as const;
}

export function useBillingOverview() {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: billingKey(organization?.id),
    queryFn: () => getBillingOverview(),
    enabled: isLoaded && Boolean(organization?.id),
  });
}

export function useUpdateBillingSettings() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: UpdateBillingSettingsInput) => updateBillingSettings(input),
    onSuccess: (data) => {
      queryClient.setQueryData(billingKey(organization?.id), data);
    },
  });
}

export function useBillingPortalSession() {
  return useMutation({
    mutationFn: () => createBillingPortalSession(),
  });
}

export function useCheckoutSession() {
  return useMutation({
    mutationFn: (input: CreateCheckoutSessionInput) => createCheckoutSession(input),
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: ChangePlanInput) => changeSubscriptionPlan(input),
    onSuccess: (data) => {
      queryClient.setQueryData(billingKey(organization?.id), data);
    },
  });
}

export function useBillingInvoices(params?: {
  page?: number;
  pageSize?: number;
  paidFrom?: string;
  paidTo?: string;
}) {
  const { organization, isLoaded } = useOrganization();
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const paidFrom = params?.paidFrom;
  const paidTo = params?.paidTo;

  return useQuery({
    queryKey: [
      ...billingKey(organization?.id),
      "invoices",
      page,
      pageSize,
      paidFrom ?? "",
      paidTo ?? "",
    ] as const,
    queryFn: () => getBillingInvoices({ page, pageSize, paidFrom, paidTo }),
    enabled: isLoaded && Boolean(organization?.id),
  });
}
