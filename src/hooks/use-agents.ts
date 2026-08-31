"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@clerk/nextjs";
import {
  createAgent,
  getAgent,
  getAgentActions,
  getAgentAnalytics,
  getAgentConversations,
  getAgentHelpDesk,
  getAgentImprove,
  getAgentKnowledge,
  getAgentPlayground,
  getAgentProcedures,
  getAgentSettings,
  getAgentsList,
  getAgentTestCases,
  getAgentTestRuns,
  getAgentWebChat,
  updateAgent,
  updateAgentActions,
  updateAgentHelpDesk,
  updateAgentKnowledge,
  updateAgentProcedures,
  updateAgentSettings,
  updateAgentWebChat,
} from "@/lib/api/agents";
import type {
  CreateAgentInput,
  ImproveKind,
  UpdateAgentActionsInput,
  UpdateAgentCoreInput,
  UpdateAgentHelpDeskInput,
  UpdateAgentKnowledgeInput,
  UpdateAgentProceduresInput,
  UpdateAgentSettingsInput,
  UpdateAgentWebChatInput,
} from "@/lib/schemas/agents";

function agentsKey(orgId?: string) {
  return ["agents", orgId] as const;
}

function agentSectionKey(orgId: string | undefined, agentId: string, section: string) {
  return ["agents", orgId, agentId, section] as const;
}

function invalidateAgentList(queryClient: ReturnType<typeof useQueryClient>, orgId?: string) {
  queryClient.invalidateQueries({ queryKey: agentsKey(orgId) });
}

function invalidateAgentCore(
  queryClient: ReturnType<typeof useQueryClient>,
  orgId: string | undefined,
  agentId: string
) {
  queryClient.invalidateQueries({
    queryKey: agentSectionKey(orgId, agentId, "core"),
  });
  invalidateAgentList(queryClient, orgId);
}

function useAgentSectionQuery<T>(
  agentId: string,
  section: string,
  queryFn: () => Promise<T>
) {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: agentSectionKey(organization?.id, agentId, section),
    queryFn,
    enabled: isLoaded && Boolean(organization?.id) && Boolean(agentId),
  });
}

export function useAgentsList() {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: agentsKey(organization?.id),
    queryFn: getAgentsList,
    enabled: isLoaded && Boolean(organization?.id),
  });
}

export function useAgent(agentId: string) {
  return useAgentSectionQuery(agentId, "core", () => getAgent(agentId));
}

export function useAgentSettings(agentId: string) {
  return useAgentSectionQuery(agentId, "settings", () => getAgentSettings(agentId));
}

export function useAgentAnalytics(agentId: string) {
  return useAgentSectionQuery(agentId, "analytics", () => getAgentAnalytics(agentId));
}

export function useAgentKnowledge(agentId: string) {
  return useAgentSectionQuery(agentId, "knowledge", () => getAgentKnowledge(agentId));
}

export function useAgentActions(agentId: string) {
  return useAgentSectionQuery(agentId, "actions", () => getAgentActions(agentId));
}

export function useAgentProcedures(agentId: string) {
  return useAgentSectionQuery(agentId, "procedures", () => getAgentProcedures(agentId));
}

export function useAgentWebChat(agentId: string) {
  return useAgentSectionQuery(agentId, "web-chat", () => getAgentWebChat(agentId));
}

export function useAgentHelpDesk(agentId: string) {
  return useAgentSectionQuery(agentId, "help-desk", () => getAgentHelpDesk(agentId));
}

export function useAgentConversations(agentId: string) {
  return useAgentSectionQuery(agentId, "conversations", () =>
    getAgentConversations(agentId)
  );
}

export function useAgentImprove(agentId: string, kind: ImproveKind) {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: [...agentSectionKey(organization?.id, agentId, "improve"), kind],
    queryFn: () => getAgentImprove(agentId, kind),
    enabled: isLoaded && Boolean(organization?.id) && Boolean(agentId),
  });
}

export function useAgentTestCases(agentId: string) {
  return useAgentSectionQuery(agentId, "test-cases", () => getAgentTestCases(agentId));
}

export function useAgentTestRuns(agentId: string) {
  return useAgentSectionQuery(agentId, "test-runs", () => getAgentTestRuns(agentId));
}

export function useAgentPlayground(agentId: string) {
  return useAgentSectionQuery(agentId, "playground", () => getAgentPlayground(agentId));
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: CreateAgentInput) => createAgent(input),
    onSuccess: () => {
      invalidateAgentList(queryClient, organization?.id);
    },
  });
}

export function useUpdateAgent(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: UpdateAgentCoreInput) => updateAgent(agentId, input),
    onSuccess: (core) => {
      queryClient.setQueryData(
        agentSectionKey(organization?.id, agentId, "core"),
        core
      );
      invalidateAgentList(queryClient, organization?.id);
    },
  });
}

export function useUpdateAgentSettings(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: UpdateAgentSettingsInput) =>
      updateAgentSettings(agentId, input),
    onSuccess: (settings) => {
      queryClient.setQueryData(
        agentSectionKey(organization?.id, agentId, "settings"),
        settings
      );
      invalidateAgentCore(queryClient, organization?.id, agentId);
    },
  });
}

export function useUpdateAgentKnowledge(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: UpdateAgentKnowledgeInput) =>
      updateAgentKnowledge(agentId, input),
    onSuccess: (knowledge) => {
      queryClient.setQueryData(
        agentSectionKey(organization?.id, agentId, "knowledge"),
        knowledge
      );
      invalidateAgentCore(queryClient, organization?.id, agentId);
    },
  });
}

export function useUpdateAgentActions(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: UpdateAgentActionsInput) =>
      updateAgentActions(agentId, input),
    onSuccess: (actions) => {
      queryClient.setQueryData(
        agentSectionKey(organization?.id, agentId, "actions"),
        actions
      );
      invalidateAgentCore(queryClient, organization?.id, agentId);
    },
  });
}

export function useUpdateAgentProcedures(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: UpdateAgentProceduresInput) =>
      updateAgentProcedures(agentId, input),
    onSuccess: (procedures) => {
      queryClient.setQueryData(
        agentSectionKey(organization?.id, agentId, "procedures"),
        procedures
      );
      invalidateAgentCore(queryClient, organization?.id, agentId);
    },
  });
}

export function useUpdateAgentWebChat(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: UpdateAgentWebChatInput) =>
      updateAgentWebChat(agentId, input),
    onSuccess: (webChat) => {
      queryClient.setQueryData(
        agentSectionKey(organization?.id, agentId, "web-chat"),
        webChat
      );
      invalidateAgentCore(queryClient, organization?.id, agentId);
    },
  });
}

export function useUpdateAgentHelpDesk(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: UpdateAgentHelpDeskInput) =>
      updateAgentHelpDesk(agentId, input),
    onSuccess: (helpDesk) => {
      queryClient.setQueryData(
        agentSectionKey(organization?.id, agentId, "help-desk"),
        helpDesk
      );
      invalidateAgentCore(queryClient, organization?.id, agentId);
    },
  });
}