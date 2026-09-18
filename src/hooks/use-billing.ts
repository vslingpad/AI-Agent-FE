"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@clerk/nextjs";
import {
  createBillingPortalSession,
  createCheckoutSession,
  getBillingOverview,
  updateBillingSettings,
} from "@/lib/api/billing";
import type {
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
