"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@clerk/nextjs";
import {
  createCustomTool,
  deleteCustomTool,
  getCustomToolsHub,
  updateCustomTool,
  updateCustomToolsSettings,
} from "@/lib/api/custom-tools";
import type {
  CreateCustomToolInput,
  UpdateCustomToolInput,
} from "@/lib/schemas/custom-tools";

function customToolsKey(orgId?: string) {
  return ["custom-tools", orgId] as const;
}

export function useCustomToolsHub() {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: customToolsKey(organization?.id),
    queryFn: getCustomToolsHub,
    enabled: isLoaded && Boolean(organization?.id),
  });
}

export function useUpdateCustomToolsSettings() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (enabled: boolean) => updateCustomToolsSettings({ enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customToolsKey(organization?.id),
      });
    },
  });
}

export function useCreateCustomTool() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: CreateCustomToolInput) => createCustomTool(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customToolsKey(organization?.id),
      });
    },
  });
}

export function useUpdateCustomTool() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateCustomToolInput;
    }) => updateCustomTool(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customToolsKey(organization?.id),
      });
    },
  });
}

export function useDeleteCustomTool() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (id: string) => deleteCustomTool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customToolsKey(organization?.id),
      });
    },
  });
}
