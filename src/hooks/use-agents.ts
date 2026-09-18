"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@clerk/nextjs";
import {
  createAgent,
  createAgentProcedure,
  createPlaygroundSession,
  createProcedureExample,
  createProcedureFromTemplate,
  deleteAgent,
  deleteAgentProcedure,
  deleteProcedureExample,
  getProcedureAnalytics,
  getProcedureExamples,
  getProcedureSimulations,
  getProcedureTemplates,
  getProcedureTriggerWarnings,
  runProcedureSimulation,
  updateAgentProcedure,
  updateProcedureExample,
  getAgent,
  getAgentActions,
  getAgentAnalytics,
  getAgentConversations,
  getAgentConversationLocations,
  getAgentDeployChannels,
  getAgentHelpDesk,
  getAgentImprove,
  resolveAgentKnowledgeGap,
  getAgentKnowledge,
  getPlaygroundSession,
  sendPlaygroundMessage,
  updatePlaygroundSession,
  getAgentProcedures,
  getAgentSettings,
  getAgentsList,
  getAgentTestCases,
  getAgentTestRuns,
  getAgentWebChat,
  updateAgent,
  updateAgentActions,
  updateAgentDeployChannel,
  updateAgentHelpDesk,
  updateAgentKnowledge,
  updateAgentProcedures,
  updateAgentSettings,
  updateAgentWebChat,
} from "@/lib/api/agents";
import type {
  AgentProceduresList,
  ConversationQuery,
  CreateAgentInput,
  ImproveQuery,
  UpdateAgentActionsInput,
  UpdateAgentCoreInput,
  UpdateAgentDeployChannelInput,
  UpdateAgentHelpDeskInput,
  UpdateAgentKnowledgeInput,
  UpdateAgentProceduresInput,
  UpdateAgentSettingsInput,
  UpdateAgentWebChatInput,
  UpdatePlaygroundSessionInput,
  SendPlaygroundMessageInput,
} from "@/lib/schemas/agents";
import type {
  CreateAgentProcedureInput,
  UpdateAgentProcedureInput,
  RunProcedureSimulationInput,
  UpdateProcedureExampleInput,
} from "@/lib/schemas/procedures";
import { DEFAULT_DASHBOARD_PERIOD } from "@/lib/dashboard/query";
import type { DashboardQueryParams } from "@/lib/schemas/dashboard";

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

export function useAgentAnalytics(agentId: string, query: DashboardQueryParams = {}) {
  const { organization, isLoaded } = useOrganization();
  const period = query.period ?? DEFAULT_DASHBOARD_PERIOD;

  return useQuery({
    queryKey: [
      "agents",
      organization?.id,
      agentId,
      "analytics",
      period,
      query.dateFrom,
      query.dateTo,
    ],
    queryFn: () => getAgentAnalytics(agentId, query),
    enabled: isLoaded && Boolean(organization?.id) && Boolean(agentId),
    placeholderData: keepPreviousData,
  });
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

export function useAgentDeployChannels(agentId: string) {
  return useAgentSectionQuery(agentId, "deploy-channels", () =>
    getAgentDeployChannels(agentId)
  );
}

export function useAgentConversations(
  agentId: string,
  params?: ConversationQuery,
  options?: { enabled?: boolean }
) {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: [...agentSectionKey(organization?.id, agentId, "conversations"), params],
    queryFn: () => getAgentConversations(agentId, params),
    enabled:
      (options?.enabled ?? true) &&
      isLoaded &&
      Boolean(organization?.id) &&
      Boolean(agentId),
  });
}

export function useAgentConversationLocations(agentId: string) {
  return useAgentSectionQuery(agentId, "conversation-locations", () =>
    getAgentConversationLocations(agentId)
  );
}

export function useAgentImprove(agentId: string, query: ImproveQuery) {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: [...agentSectionKey(organization?.id, agentId, "improve"), query],
    queryFn: () => getAgentImprove(agentId, query),
    enabled: isLoaded && Boolean(organization?.id) && Boolean(agentId),
  });
}

export function useResolveKnowledgeGap(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (conversationId: string) =>
      resolveAgentKnowledgeGap(agentId, conversationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: agentSectionKey(organization?.id, agentId, "improve"),
      });
      void queryClient.invalidateQueries({
        queryKey: agentSectionKey(organization?.id, agentId, "conversations"),
      });
    },
  });
}

export function useAgentTestCases(agentId: string) {
  return useAgentSectionQuery(agentId, "test-cases", () => getAgentTestCases(agentId));
}

export function useAgentTestRuns(agentId: string) {
  return useAgentSectionQuery(agentId, "test-runs", () => getAgentTestRuns(agentId));
}

function playgroundSessionKey(
  orgId: string | undefined,
  agentId: string,
  sessionId: string
) {
  return ["agents", orgId, agentId, "playground", sessionId] as const;
}

export function useCreatePlaygroundSession(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input?: Parameters<typeof createPlaygroundSession>[1]) =>
      createPlaygroundSession(agentId, input ?? {}),
    onSuccess: (session) => {
      queryClient.setQueryData(
        playgroundSessionKey(organization?.id, agentId, session.id),
        session
      );
    },
  });
}

export function usePlaygroundSession(agentId: string, sessionId: string | null) {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: playgroundSessionKey(organization?.id, agentId, sessionId ?? ""),
    queryFn: () => getPlaygroundSession(agentId, sessionId!),
    enabled: isLoaded && Boolean(organization?.id) && Boolean(agentId) && Boolean(sessionId),
  });
}

export function useUpdatePlaygroundSession(agentId: string, sessionId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: UpdatePlaygroundSessionInput) =>
      updatePlaygroundSession(agentId, sessionId, input),
    onSuccess: (session) => {
      queryClient.setQueryData(
        playgroundSessionKey(organization?.id, agentId, sessionId),
        session
      );
    },
  });
}

export function useSendPlaygroundMessage(agentId: string, sessionId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: SendPlaygroundMessageInput) =>
      sendPlaygroundMessage(agentId, sessionId, input),
    onSuccess: (session) => {
      queryClient.setQueryData(
        playgroundSessionKey(organization?.id, agentId, sessionId),
        session
      );
    },
  });
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

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (agentId: string) => deleteAgent(agentId),
    onSuccess: (_result, agentId) => {
      queryClient.removeQueries({
        queryKey: ["agents", organization?.id, agentId],
      });
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

export function useCreateAgentProcedure(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: CreateAgentProcedureInput) =>
      createAgentProcedure(agentId, input),
    onSuccess: (created) => {
      queryClient.setQueryData(
        agentSectionKey(organization?.id, agentId, "procedures"),
        (current: AgentProceduresList | undefined) => ({
          procedures: [...(current?.procedures ?? []), created],
        })
      );
      invalidateAgentCore(queryClient, organization?.id, agentId);
    },
  });
}

export function useUpdateAgentProcedure(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: ({
      procedureId,
      input,
    }: {
      procedureId: string;
      input: UpdateAgentProcedureInput;
    }) => updateAgentProcedure(agentId, procedureId, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        agentSectionKey(organization?.id, agentId, "procedures"),
        (current: AgentProceduresList | undefined) => ({
          procedures: (current?.procedures ?? []).map((item) =>
            item.id === updated.id ? updated : item
          ),
        })
      );
      invalidateAgentCore(queryClient, organization?.id, agentId);
    },
  });
}

export function useDeleteAgentProcedure(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (procedureId: string) =>
      deleteAgentProcedure(agentId, procedureId),
    onSuccess: (_result, procedureId) => {
      queryClient.setQueryData(
        agentSectionKey(organization?.id, agentId, "procedures"),
        (current: AgentProceduresList | undefined) => ({
          procedures: (current?.procedures ?? []).filter(
            (item) => item.id !== procedureId
          ),
        })
      );
      invalidateAgentCore(queryClient, organization?.id, agentId);
    },
  });
}

export function useProcedureTemplates(agentId: string, enabled = true) {
  const { organization } = useOrganization();
  return useQuery({
    queryKey: [organization?.id, agentId, "procedure-templates"],
    queryFn: () => getProcedureTemplates(agentId),
    enabled: enabled && Boolean(organization?.id && agentId),
  });
}

export function useCreateProcedureFromTemplate(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  return useMutation({
    mutationFn: (templateId: string) => createProcedureFromTemplate(agentId, templateId),
    onSuccess: (created) => {
      queryClient.setQueryData(
        agentSectionKey(organization?.id, agentId, "procedures"),
        (current: AgentProceduresList | undefined) => ({
          procedures: [...(current?.procedures ?? []), created],
        })
      );
    },
  });
}

export function useProcedureTriggerWarnings(agentId: string) {
  const { organization } = useOrganization();
  return useQuery({
    queryKey: [organization?.id, agentId, "procedure-trigger-warnings"],
    queryFn: () => getProcedureTriggerWarnings(agentId),
    enabled: Boolean(organization?.id && agentId),
  });
}

export function useProcedureExamples(agentId: string, procedureId: string) {
  const { organization } = useOrganization();
  return useQuery({
    queryKey: [organization?.id, agentId, "procedure-examples", procedureId],
    queryFn: () => getProcedureExamples(agentId, procedureId),
    enabled: Boolean(organization?.id && agentId && procedureId),
  });
}

export function useCreateProcedureExample(agentId: string, procedureId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  return useMutation({
    mutationFn: (input: { kind: "include" | "exclude"; text: string }) =>
      createProcedureExample(agentId, procedureId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [organization?.id, agentId, "procedure-examples", procedureId],
      });
    },
  });
}

export function useUpdateProcedureExample(agentId: string, procedureId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  return useMutation({
    mutationFn: ({
      exampleId,
      input,
    }: {
      exampleId: string;
      input: UpdateProcedureExampleInput;
    }) => updateProcedureExample(agentId, procedureId, exampleId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [organization?.id, agentId, "procedure-examples", procedureId],
      });
    },
  });
}

export function useDeleteProcedureExample(agentId: string, procedureId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  return useMutation({
    mutationFn: (exampleId: string) =>
      deleteProcedureExample(agentId, procedureId, exampleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [organization?.id, agentId, "procedure-examples", procedureId],
      });
    },
  });
}

export function useProcedureAnalytics(agentId: string, procedureId: string) {
  const { organization } = useOrganization();
  return useQuery({
    queryKey: [organization?.id, agentId, "procedure-analytics", procedureId],
    queryFn: () => getProcedureAnalytics(agentId, procedureId),
    enabled: Boolean(organization?.id && agentId && procedureId),
  });
}

export function useProcedureSimulations(agentId: string, procedureId: string) {
  const { organization } = useOrganization();
  return useQuery({
    queryKey: [organization?.id, agentId, "procedure-simulations", procedureId],
    queryFn: () => getProcedureSimulations(agentId, procedureId),
    enabled: Boolean(organization?.id && agentId && procedureId),
  });
}

export function useRunProcedureSimulation(agentId: string, procedureId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  return useMutation({
    mutationFn: (input: RunProcedureSimulationInput) =>
      runProcedureSimulation(agentId, procedureId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [organization?.id, agentId, "procedure-simulations", procedureId],
      });
      queryClient.invalidateQueries({
        queryKey: agentSectionKey(organization?.id, agentId, "procedures"),
      });
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

export function useUpdateAgentDeployChannel(agentId: string) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (input: UpdateAgentDeployChannelInput) =>
      updateAgentDeployChannel(agentId, input),
    onSuccess: (channels) => {
      queryClient.setQueryData(
        agentSectionKey(organization?.id, agentId, "deploy-channels"),
        channels
      );
      invalidateAgentCore(queryClient, organization?.id, agentId);
    },
  });
}