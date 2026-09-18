import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  AgentActionsListSchema,
  AgentAnalyticsSchema,
  AgentConversationsListSchema,
  AgentConversationLocationsSchema,
  AgentCoreSchema,
  AgentDeployChannelsSchema,
  AgentImproveListSchema,
  AgentKnowledgeSchema,
  CreatePlaygroundSessionInputSchema,
  PlaygroundSessionSchema,
  SendPlaygroundMessageInputSchema,
  SendPlaygroundMessageResponseSchema,
  UpdatePlaygroundSessionInputSchema,
  AgentProceduresListSchema,
  AgentProcedureBindingSchema,
  AgentSettingsSchema,
  AgentTestCasesListSchema,
  AgentTestRunsListSchema,
  AgentsListSchema,
  CreateAgentInputSchema,
  HelpDeskBindingSchema,
  UpdateAgentActionsInputSchema,
  UpdateAgentCoreInputSchema,
  UpdateAgentDeployChannelInputSchema,
  UpdateAgentHelpDeskInputSchema,
  UpdateAgentKnowledgeInputSchema,
  UpdateAgentProceduresInputSchema,
  UpdateAgentSettingsInputSchema,
  UpdateAgentWebChatInputSchema,
  WebChatConfigSchema,
  type AgentActionsList,
  type AgentAnalytics,
  type AgentConversationsList,
  type AgentConversationLocations,
  type AgentCore,
  type AgentDeployChannels,
  type ConversationQuery,
  type AgentImproveList,
  type AgentKnowledge,
  type CreatePlaygroundSessionInput,
  type PlaygroundSession,
  type SendPlaygroundMessageInput,
  type UpdatePlaygroundSessionInput,
  type AgentProceduresList,
  type AgentProcedureBinding,
  type AgentSettings,
  type AgentsList,
  type CreateAgentInput,
  type HelpDeskBinding,
  type ImproveKind,
  type ImproveQuery,
  type UpdateAgentActionsInput,
  type UpdateAgentCoreInput,
  type UpdateAgentDeployChannelInput,
  type UpdateAgentHelpDeskInput,
  type UpdateAgentKnowledgeInput,
  type UpdateAgentProceduresInput,
  type UpdateAgentSettingsInput,
  type UpdateAgentWebChatInput,
  type WebChatConfig,
} from "@/lib/schemas/agents";
import {
  CreateAgentProcedureInputSchema,
  UpdateAgentProcedureInputSchema,
  type CreateAgentProcedureInput,
  type UpdateAgentProcedureInput,
  ProcedureTemplatesListSchema,
  ProcedureTriggerWarningsListSchema,
  ProcedureExamplesListSchema,
  ProcedureExampleSchema,
  UpdateProcedureExampleInputSchema,
  ProcedureAnalyticsSchema,
  ProcedureSimulationsListSchema,
  RunProcedureSimulationInputSchema,
  RunProcedureSimulationResponseSchema,
  type RunProcedureSimulationInput,
  type UpdateProcedureExampleInput,
} from "@/lib/schemas/procedures";
import { serializeProcedureBody } from "@/lib/procedures/step-utils";
import type { DashboardQueryParams } from "@/lib/schemas/dashboard";

export async function getAgentsList(): Promise<AgentsList> {
  const json = await apiGet<unknown>("/api/agents");
  return AgentsListSchema.parse(json);
}

export async function getAgent(agentId: string): Promise<AgentCore> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}`);
  return AgentCoreSchema.parse(json);
}

export async function getAgentSettings(agentId: string): Promise<AgentSettings> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/settings`);
  return AgentSettingsSchema.parse(json);
}

export async function getAgentAnalytics(
  agentId: string,
  params: DashboardQueryParams = {}
): Promise<AgentAnalytics> {
  const hasCustomRange = Boolean(params.dateFrom || params.dateTo);
  const json = await apiGet<unknown>(`/api/agents/${agentId}/analytics`, {
    period: hasCustomRange ? undefined : params.period,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });
  return AgentAnalyticsSchema.parse(json);
}

export async function getAgentKnowledge(agentId: string): Promise<AgentKnowledge> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/knowledge`);
  return AgentKnowledgeSchema.parse(json);
}

export async function getAgentActions(agentId: string): Promise<AgentActionsList> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/actions`);
  return AgentActionsListSchema.parse(json);
}

export async function getAgentProcedures(agentId: string): Promise<AgentProceduresList> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/procedures`);
  return AgentProceduresListSchema.parse(json);
}

export async function createAgentProcedure(
  agentId: string,
  input: CreateAgentProcedureInput
): Promise<AgentProcedureBinding> {
  const parsed = CreateAgentProcedureInputSchema.parse(input);
  const json = await apiPost<unknown>(`/api/agents/${agentId}/procedures`, {
    ...parsed,
    body: serializeProcedureBody(parsed.body),
  });
  return AgentProcedureBindingSchema.parse(json);
}

export async function updateAgentProcedure(
  agentId: string,
  procedureId: string,
  input: UpdateAgentProcedureInput
): Promise<AgentProcedureBinding> {
  const parsed = UpdateAgentProcedureInputSchema.parse(input);
  const payload = {
    ...parsed,
    ...(parsed.body ? { body: serializeProcedureBody(parsed.body) } : {}),
  };
  const json = await apiPatch<unknown>(
    `/api/agents/${agentId}/procedures/${procedureId}`,
    payload
  );
  return AgentProcedureBindingSchema.parse(json);
}

export async function deleteAgentProcedure(
  agentId: string,
  procedureId: string
): Promise<void> {
  await apiDelete(`/api/agents/${agentId}/procedures/${procedureId}`);
}

export async function getProcedureTemplates(agentId: string) {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/procedures/templates`);
  return ProcedureTemplatesListSchema.parse(json);
}

export async function createProcedureFromTemplate(agentId: string, templateId: string) {
  const json = await apiPost<unknown>(`/api/agents/${agentId}/procedures/from-template`, {
    templateId,
  });
  return AgentProcedureBindingSchema.parse(json);
}

export async function getProcedureTriggerWarnings(agentId: string) {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/procedures/trigger-warnings`);
  return ProcedureTriggerWarningsListSchema.parse(json);
}

export async function getProcedureExamples(agentId: string, procedureId: string) {
  const json = await apiGet<unknown>(
    `/api/agents/${agentId}/procedures/${procedureId}/examples`
  );
  return ProcedureExamplesListSchema.parse(json);
}

export async function createProcedureExample(
  agentId: string,
  procedureId: string,
  input: { kind: "include" | "exclude"; text: string }
) {
  const json = await apiPost<unknown>(
    `/api/agents/${agentId}/procedures/${procedureId}/examples`,
    input
  );
  return ProcedureExampleSchema.parse(json);
}

export async function updateProcedureExample(
  agentId: string,
  procedureId: string,
  exampleId: string,
  input: UpdateProcedureExampleInput
) {
  const parsed = UpdateProcedureExampleInputSchema.parse(input);
  const json = await apiPatch<unknown>(
    `/api/agents/${agentId}/procedures/${procedureId}/examples/${exampleId}`,
    parsed
  );
  return ProcedureExampleSchema.parse(json);
}

export async function deleteProcedureExample(
  agentId: string,
  procedureId: string,
  exampleId: string
) {
  await apiDelete(
    `/api/agents/${agentId}/procedures/${procedureId}/examples/${exampleId}`
  );
}

export async function getProcedureAnalytics(agentId: string, procedureId: string) {
  const json = await apiGet<unknown>(
    `/api/agents/${agentId}/procedures/${procedureId}/analytics`
  );
  return ProcedureAnalyticsSchema.parse(json);
}

export async function getProcedureSimulations(agentId: string, procedureId: string) {
  const json = await apiGet<unknown>(
    `/api/agents/${agentId}/procedures/${procedureId}/simulations`
  );
  return ProcedureSimulationsListSchema.parse(json);
}

export async function runProcedureSimulation(
  agentId: string,
  procedureId: string,
  input: RunProcedureSimulationInput
) {
  const parsed = RunProcedureSimulationInputSchema.parse(input);
  const json = await apiPost<unknown>(
    `/api/agents/${agentId}/procedures/${procedureId}/simulate`,
    parsed
  );
  return RunProcedureSimulationResponseSchema.parse(json);
}

export async function getAgentWebChat(agentId: string): Promise<WebChatConfig> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/deploy/web-chat`);
  return WebChatConfigSchema.parse(json);
}

export async function getAgentHelpDesk(agentId: string): Promise<HelpDeskBinding> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/deploy/help-desk`);
  return HelpDeskBindingSchema.parse(json);
}

export async function getAgentDeployChannels(
  agentId: string
): Promise<AgentDeployChannels> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/deploy/channels`);
  return AgentDeployChannelsSchema.parse(json);
}

export async function updateAgentDeployChannel(
  agentId: string,
  input: UpdateAgentDeployChannelInput
): Promise<AgentDeployChannels> {
  const parsed = UpdateAgentDeployChannelInputSchema.parse(input);
  const json = await apiPatch<unknown>(
    `/api/agents/${agentId}/deploy/channels`,
    parsed
  );
  return AgentDeployChannelsSchema.parse(json);
}

export async function getAgentConversations(
  agentId: string,
  params?: ConversationQuery
): Promise<AgentConversationsList> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/conversations`, {
    customer: params?.customer,
    conversationId: params?.conversationId,
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
    location: params?.location,
    channel: params?.channel,
    status: params?.status,
    billable:
      params?.billable === undefined ? undefined : String(params.billable),
    knowledgeGap:
      params?.knowledgeGap === undefined
        ? undefined
        : String(params.knowledgeGap),
    page: params?.page === undefined ? undefined : String(params.page),
    pageSize: params?.pageSize === undefined ? undefined : String(params.pageSize),
  });
  return AgentConversationsListSchema.parse(json);
}

export async function getAgentConversationLocations(
  agentId: string
): Promise<AgentConversationLocations> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/conversations/locations`);
  return AgentConversationLocationsSchema.parse(json);
}

export async function exportAgentConversations(
  agentId: string,
  params?: Omit<ConversationQuery, "page" | "pageSize">
): Promise<Blob> {
  const response = await fetch(
    `/api/agents/${agentId}/conversations/export?${new URLSearchParams(
      Object.entries({
        customer: params?.customer,
        conversationId: params?.conversationId,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        location: params?.location,
        channel: params?.channel,
        status: params?.status,
        billable:
          params?.billable === undefined ? undefined : String(params.billable),
        knowledgeGap:
          params?.knowledgeGap === undefined
            ? undefined
            : String(params.knowledgeGap),
      }).filter(([, value]) => value !== undefined) as [string, string][]
    ).toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to export conversations");
  }

  return response.blob();
}

export async function getAgentImprove(
  agentId: string,
  query: ImproveQuery
): Promise<AgentImproveList> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/improve`, {
    kind: query.kind,
    status: query.status,
    page: query.page === undefined ? undefined : String(query.page),
    pageSize:
      query.pageSize === undefined ? undefined : String(query.pageSize),
  });
  return AgentImproveListSchema.parse(json);
}

export async function resolveAgentKnowledgeGap(
  agentId: string,
  conversationId: string
): Promise<void> {
  await apiPost(
    `/api/agents/${agentId}/conversations/${encodeURIComponent(conversationId)}/knowledge-gap/resolve`,
    {}
  );
}

export async function getAgentTestCases(agentId: string) {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/test/cases`);
  return AgentTestCasesListSchema.parse(json);
}

export async function getAgentTestRuns(agentId: string) {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/test/runs`);
  return AgentTestRunsListSchema.parse(json);
}

export async function createPlaygroundSession(
  agentId: string,
  input: CreatePlaygroundSessionInput = {}
): Promise<PlaygroundSession> {
  const parsed = CreatePlaygroundSessionInputSchema.parse(input);
  const json = await apiPost<unknown>(
    `/api/agents/${agentId}/test/playground`,
    parsed
  );
  return PlaygroundSessionSchema.parse(json);
}

export async function getPlaygroundSession(
  agentId: string,
  sessionId: string
): Promise<PlaygroundSession> {
  const json = await apiGet<unknown>(
    `/api/agents/${agentId}/test/playground/${sessionId}`
  );
  return PlaygroundSessionSchema.parse(json);
}

export async function updatePlaygroundSession(
  agentId: string,
  sessionId: string,
  input: UpdatePlaygroundSessionInput
): Promise<PlaygroundSession> {
  const parsed = UpdatePlaygroundSessionInputSchema.parse(input);
  const json = await apiPatch<unknown>(
    `/api/agents/${agentId}/test/playground/${sessionId}`,
    parsed
  );
  return PlaygroundSessionSchema.parse(json);
}

export async function sendPlaygroundMessage(
  agentId: string,
  sessionId: string,
  input: SendPlaygroundMessageInput
): Promise<PlaygroundSession> {
  const parsed = SendPlaygroundMessageInputSchema.parse(input);
  const json = await apiPost<unknown>(
    `/api/agents/${agentId}/test/playground/${sessionId}/messages`,
    parsed
  );
  return SendPlaygroundMessageResponseSchema.parse(json).session;
}

export async function createAgent(input: CreateAgentInput): Promise<AgentCore> {
  const parsed = CreateAgentInputSchema.parse(input);
  const json = await apiPost<unknown>("/api/agents", parsed);
  return AgentCoreSchema.parse(json);
}

export async function updateAgent(
  agentId: string,
  input: UpdateAgentCoreInput
): Promise<AgentCore> {
  const parsed = UpdateAgentCoreInputSchema.parse(input);
  const json = await apiPatch<unknown>(`/api/agents/${agentId}`, parsed);
  return AgentCoreSchema.parse(json);
}

export async function deleteAgent(agentId: string): Promise<void> {
  await apiDelete(`/api/agents/${agentId}`);
}

export async function updateAgentSettings(
  agentId: string,
  input: UpdateAgentSettingsInput
): Promise<AgentSettings> {
  const parsed = UpdateAgentSettingsInputSchema.parse(input);
  const json = await apiPatch<unknown>(`/api/agents/${agentId}/settings`, parsed);
  return AgentSettingsSchema.parse(json);
}

export async function updateAgentKnowledge(
  agentId: string,
  input: UpdateAgentKnowledgeInput
): Promise<AgentKnowledge> {
  const parsed = UpdateAgentKnowledgeInputSchema.parse(input);
  const json = await apiPatch<unknown>(`/api/agents/${agentId}/knowledge`, parsed);
  return AgentKnowledgeSchema.parse(json);
}

export async function updateAgentActions(
  agentId: string,
  input: UpdateAgentActionsInput
): Promise<AgentActionsList> {
  const parsed = UpdateAgentActionsInputSchema.parse(input);
  const json = await apiPatch<unknown>(`/api/agents/${agentId}/actions`, parsed);
  return AgentActionsListSchema.parse(json);
}

export async function updateAgentProcedures(
  agentId: string,
  input: UpdateAgentProceduresInput
): Promise<AgentProceduresList> {
  const parsed = UpdateAgentProceduresInputSchema.parse(input);
  const json = await apiPatch<unknown>(`/api/agents/${agentId}/procedures`, parsed);
  return AgentProceduresListSchema.parse(json);
}

export async function updateAgentWebChat(
  agentId: string,
  input: UpdateAgentWebChatInput
): Promise<WebChatConfig> {
  const parsed = UpdateAgentWebChatInputSchema.parse(input);
  const json = await apiPatch<unknown>(
    `/api/agents/${agentId}/deploy/web-chat`,
    parsed
  );
  return WebChatConfigSchema.parse(json);
}

export async function updateAgentHelpDesk(
  agentId: string,
  input: UpdateAgentHelpDeskInput
): Promise<HelpDeskBinding> {
  const parsed = UpdateAgentHelpDeskInputSchema.parse(input);
  const json = await apiPatch<unknown>(
    `/api/agents/${agentId}/deploy/help-desk`,
    parsed
  );
  return HelpDeskBindingSchema.parse(json);
}
