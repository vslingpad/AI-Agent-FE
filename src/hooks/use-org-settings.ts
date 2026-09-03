"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useClerk, useOrganization } from "@clerk/nextjs";
import {
  leaveOrganization,
  removeOrganizationLogo,
  updateOrganizationSettings,
  uploadOrganizationLogo,
} from "@/lib/api/org-settings";
import { SELECT_ORGANIZATION_PATH } from "@/lib/constants/routes";
import type { UpdateOrganizationSettingsInput } from "@/lib/schemas/org-settings";

function orgSettingsKey(orgId?: string) {
  return ["org-settings", orgId] as const;
}

export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: UpdateOrganizationSettingsInput) => updateOrganizationSettings(input),
    onSuccess: async () => {
      await organization?.reload();
      void queryClient.invalidateQueries({ queryKey: orgSettingsKey(organization?.id) });
    },
  });
}

export function useUploadOrganizationLogo() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (file: File) => uploadOrganizationLogo(file),
    onSuccess: async () => {
      await organization?.reload();
      void queryClient.invalidateQueries({ queryKey: orgSettingsKey(organization?.id) });
    },
  });
}

export function useRemoveOrganizationLogo() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: () => removeOrganizationLogo(),
    onSuccess: async () => {
      await organization?.reload();
      void queryClient.invalidateQueries({ queryKey: orgSettingsKey(organization?.id) });
    },
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();
  const clerk = useClerk();

  return useMutation({
    mutationFn: () => leaveOrganization(),
    onSuccess: async () => {
      queryClient.clear();
      await clerk.setActive({ organization: null });
      window.location.assign(SELECT_ORGANIZATION_PATH);
    },
  });
}
