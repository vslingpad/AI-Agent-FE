import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  AgentActionsListSchema,
  AgentAnalyticsSchema,
  AgentConversationsListSchema,
  AgentCoreSchema,
  AgentImproveListSchema,
  AgentKnowledgeSchema,
  AgentPlaygroundSchema,
  AgentProceduresListSchema,
  AgentSettingsSchema,
  AgentTestCasesListSchema,
  AgentTestRunsListSchema,
  AgentsListSchema,
  CreateAgentInputSchema,
  HelpDeskBindingSchema,
  UpdateAgentActionsInputSchema,
  UpdateAgentCoreInputSchema,
  UpdateAgentHelpDeskInputSchema,
  UpdateAgentKnowledgeInputSchema,
  UpdateAgentProceduresInputSchema,
  UpdateAgentSettingsInputSchema,
  UpdateAgentWebChatInputSchema,
  WebChatConfigSchema,
  type AgentActionsList,
  type AgentAnalytics,
  type AgentConversationsList,
  type AgentCore,
  type AgentImproveList,
  type AgentKnowledge,
  type AgentPlayground,
  type AgentProceduresList,
  type AgentSettings,
  type AgentsList,
  type CreateAgentInput,
  type HelpDeskBinding,
  type ImproveKind,
  type UpdateAgentActionsInput,
  type UpdateAgentCoreInput,
  type UpdateAgentHelpDeskInput,
  type UpdateAgentKnowledgeInput,
  type UpdateAgentProceduresInput,
  type UpdateAgentSettingsInput,
  type UpdateAgentWebChatInput,
  type WebChatConfig,
} from "@/lib/schemas/agents";

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

export async function getAgentAnalytics(agentId: string): Promise<AgentAnalytics> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/analytics`);
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

export async function getAgentWebChat(agentId: string): Promise<WebChatConfig> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/deploy/web-chat`);
  return WebChatConfigSchema.parse(json);
}

export async function getAgentHelpDesk(agentId: string): Promise<HelpDeskBinding> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/deploy/help-desk`);
  return HelpDeskBindingSchema.parse(json);
}

export async function getAgentConversations(
  agentId: string
): Promise<AgentConversationsList> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/conversations`);
  return AgentConversationsListSchema.parse(json);
}

export async function getAgentImprove(
  agentId: string,
  kind?: ImproveKind
): Promise<AgentImproveList> {
  const json = await apiGet<unknown>(
    `/api/agents/${agentId}/improve`,
    kind ? { kind } : undefined
  );
  return AgentImproveListSchema.parse(json);
}

export async function getAgentTestCases(agentId: string) {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/test/cases`);
  return AgentTestCasesListSchema.parse(json);
}

export async function getAgentTestRuns(agentId: string) {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/test/runs`);
  return AgentTestRunsListSchema.parse(json);
}

export async function getAgentPlayground(agentId: string): Promise<AgentPlayground> {
  const json = await apiGet<unknown>(`/api/agents/${agentId}/test/playground`);
  return AgentPlaygroundSchema.parse(json);
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
