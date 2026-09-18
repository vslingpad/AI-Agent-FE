"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@clerk/nextjs";
import {
  completeOAuthStep,
  createOrgConnector,
  deleteOrgConnector,
  getConnectStatus,
  getConnectorDetail,
  getIntegrationsHub,
  startReauth,
  startOAuthStep,
  updateOrgConnector,
} from "@/lib/api/integrations";
import type {
  CreateConnectorInput,
  UpdateConnectorInput,
} from "@/lib/schemas/integrations";

function integrationsKey(orgId?: string) {
  return ["integrations", orgId] as const;
}

export function useIntegrationsHub() {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: integrationsKey(organization?.id),
    queryFn: getIntegrationsHub,
    enabled: isLoaded && Boolean(organization?.id),
  });
}

function connectorDetailKey(orgId?: string, connectorId?: string) {
  return ["integrations", orgId, "detail", connectorId] as const;
}

export function useConnectorDetail(connectorId: string) {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: connectorDetailKey(organization?.id, connectorId),
    queryFn: () => getConnectorDetail(connectorId),
    enabled: isLoaded && Boolean(organization?.id) && Boolean(connectorId),
  });
}

/** @deprecated Use useConnectorDetail */
export function useOrgConnector(connectorId: string) {
  return useConnectorDetail(connectorId);
}

export function useCreateConnector() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: CreateConnectorInput) => createOrgConnector(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: integrationsKey(organization?.id),
      });
    },
  });
}

export function useUpdateConnector(connectorId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: UpdateConnectorInput) =>
      updateOrgConnector(connectorId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: connectorDetailKey(organization?.id, connectorId),
      });
      queryClient.invalidateQueries({
        queryKey: integrationsKey(organization?.id),
      });
    },
  });
}

export function useDeleteConnector() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (connectorId: string) => deleteOrgConnector(connectorId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: integrationsKey(organization?.id),
      });
    },
  });
}

export function useCompleteOAuthStep(connectorId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: ({
      connect_session_id,
      step_id,
    }: {
      connect_session_id: string;
      step_id: string;
    }) => completeOAuthStep(connectorId, connect_session_id, step_id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: connectorDetailKey(organization?.id, connectorId),
      });
      queryClient.invalidateQueries({
        queryKey: integrationsKey(organization?.id),
      });
    },
  });
}

export function useStartReauth(connectorId: string) {
  return useMutation({
    mutationFn: () => startReauth(connectorId),
  });
}

export function useStartOAuthStep(connectorId: string) {
  return useMutation({
    mutationFn: (stepId: "global_auth" | "sunshine") =>
      startOAuthStep(connectorId, stepId),
  });
}

export function useConnectStatus(
  connectorId: string,
  connectSessionId: string | null,
  enabled = false
) {
  return useQuery({
    queryKey: ["connect-status", connectorId, connectSessionId],
    queryFn: () => getConnectStatus(connectorId, connectSessionId!),
    enabled: enabled && Boolean(connectSessionId),
    refetchInterval: enabled ? 2000 : false,
  });
}
