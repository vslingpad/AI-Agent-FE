import { z } from "zod";

export const AgentStatusSchema = z.enum(["draft", "live"]);
export const AgentIconSchema = z.enum(["support", "billing", "technical"]);
export const KnowledgeSourceStateSchema = z.enum([
  "connected",
  "not_connected",
  "reauth_required",
]);
export const ConversationChannelSchema = z.enum([
  "web_chat",
  "zendesk",
  "playground",
]);
export const ConversationStatusSchema = z.enum([
  "ai_active",
  "handed_over",
  "resolved",
]);
export const ImproveKindSchema = z.enum([
  "knowledge-gap",
  "knowledge-conflict",
  "duplicate-content",
  "missing-action",
  "missing-procedure",
]);
export const ImproveStatusSchema = z.enum(["open", "reviewing", "resolved"]);
export const TestResultSchema = z.enum(["pass", "fail", "none"]);
export const TestRunStatusSchema = z.enum(["passed", "failed", "running"]);

export const AgentListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: AgentIconSchema,
  status: AgentStatusSchema,
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
  tickets: z.number(),
  resolutionRate: z.number(),
  handoffRate: z.number(),
  knowledgeSourceCount: z.number(),
  liveChannelCount: z.number(),
  openImproveCount: z.number(),
});

export const AgentSettingsSchema = z.object({
  systemPrompt: z.string(),
  handoverConnectorId: z.string(),
});

export const AgentKpiSchema = z.object({
  id: z.string(),
  label: z.string(),
  displayValue: z.string(),
  change: z.number(),
  changeLabel: z.string(),
  direction: z.enum(["up", "down", "neutral"]),
  invert: z.boolean().nullish(),
  sparkline: z.array(z.number()),
});

export const AgentAnalyticsSchema = z.object({
  kpis: z.array(AgentKpiSchema),
  ticketsOverTime: z.array(
    z.object({
      date: z.string(),
      label: z.string(),
      value: z.number(),
    })
  ),
  topTopics: z.array(
    z.object({
      topic: z.string(),
      conversations: z.number(),
      resolutionRate: z.number(),
    })
  ),
  avgConfidence: z.number(),
  knowledgeGroundedRate: z.number(),
  remainingCredits: z.number(),
  includedCredits: z.number(),
});

export const KnowledgeOptionKindSchema = z.enum([
  "website",
  "files",
  "qna",
  "help_center",
  "tickets",
]);

export const KnowledgeResourceSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("url"),
    id: z.string(),
    title: z.string(),
    url: z.string(),
    pageCount: z.number(),
    status: z.enum(["indexed", "crawling", "failed"]),
    updatedAt: z.string(),
    addedBy: z.string(),
    trained: z.boolean(),
  }),
  z.object({
    type: z.literal("file"),
    id: z.string(),
    name: z.string(),
    sizeLabel: z.string(),
    status: z.enum(["indexed", "processing", "failed"]),
    updatedAt: z.string(),
    addedBy: z.string(),
    trained: z.boolean(),
  }),
  z.object({
    type: z.literal("qna"),
    id: z.string(),
    title: z.string(),
    question: z.string(),
    questions: z.array(z.string()).optional(),
    answer: z.string(),
    updatedAt: z.string(),
    addedBy: z.string(),
    trained: z.boolean(),
  }),
  z.object({
    type: z.literal("article"),
    id: z.string(),
    title: z.string(),
    collection: z.string(),
    status: z.enum(["indexed", "pending", "failed"]),
    updatedAt: z.string(),
    trained: z.boolean(),
  }),
  z.object({
    type: z.literal("ticket"),
    id: z.string(),
    subject: z.string(),
    ticketStatus: z.string(),
    updatedAt: z.string(),
    trained: z.boolean(),
  }),
]);

export const KnowledgeCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  articleCount: z.number(),
});

export const KnowledgeSourceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  kind: KnowledgeOptionKindSchema,
  vendorSlug: z.string().nullable(),
  state: KnowledgeSourceStateSchema,
  enabled: z.boolean(),
  instanceName: z.string().nullable(),
  lastSyncedAt: z.string().nullable(),
  collections: z.array(KnowledgeCollectionSchema),
  resources: z.array(KnowledgeResourceSchema),
});

export const AgentKnowledgeSchema = z.object({
  sources: z.array(KnowledgeSourceSchema),
});

export const AgentActionSubActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
});

export const AgentActionBindingSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  kind: z.enum(["connector", "custom_tool"]),
  description: z.string(),
  connected: z.boolean(),
  connectorId: z.string().nullable(),
  identifier: z.string().nullable(),
  subActions: z.array(AgentActionSubActionSchema),
});

export const AgentProcedureBindingSchema = z.object({
  id: z.string(),
  name: z.string(),
  whenToUse: z.string(),
  status: z.enum(["draft", "live"]),
  enabled: z.boolean(),
  stepCount: z.number(),
  lastSimulatedAt: z.string().nullable(),
});

export const WebChatConfigSchema = z.object({
  enabled: z.boolean(),
  greeting: z.string(),
  position: z.enum(["left", "right"]),
  primaryColor: z.string(),
  domainAllowlist: z.array(z.string()),
  publishableKey: z.string(),
});

export const HelpDeskBindingSchema = z.object({
  connectorId: z.string(),
  slug: z.string(),
  name: z.string(),
  identifier: z.string(),
  status: z.enum(["active", "reauth_required", "not_connected"]),
  useChannel: z.boolean(),
  routing: z.enum(["inherit", "custom"]),
});

export const ConversationMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["customer", "assistant", "system"]),
  content: z.string(),
  at: z.string(),
});

export const AgentConversationSchema = z.object({
  id: z.string(),
  channel: ConversationChannelSchema,
  customerName: z.string().nullish(),
  customerEmail: z.string().nullish(),
  location: z.string().nullish(),
  preview: z.string(),
  status: ConversationStatusSchema,
  startedAt: z.string(),
  messageCount: z.number(),
  billable: z.boolean(),
  knowledgeGap: z.boolean(),
  messages: z.array(ConversationMessageSchema),
});

export const ImproveItemSchema = z.object({
  id: z.string(),
  kind: ImproveKindSchema,
  title: z.string(),
  description: z.string(),
  status: ImproveStatusSchema,
  occurrences: z.number(),
  conversationId: z.string().nullable(),
  suggestedAction: z.string(),
  createdAt: z.string(),
});

export const TestCaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  prompt: z.string(),
  expectedContains: z.string(),
  lastResult: TestResultSchema,
  lastRunAt: z.string().nullable(),
});

export const TestRunSchema = z.object({
  id: z.string(),
  name: z.string(),
  startedAt: z.string(),
  status: TestRunStatusSchema,
  passRate: z.number(),
  caseCount: z.number(),
});

/** Lightweight agent metadata — returned by GET/PATCH /api/agents/:agentId */
export const AgentCoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: AgentIconSchema,
  status: AgentStatusSchema,
  hasUnpublishedChanges: z.boolean(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
});

export const AgentActionsListSchema = z.object({
  actions: z.array(AgentActionBindingSchema),
});

export const AgentProceduresListSchema = z.object({
  procedures: z.array(AgentProcedureBindingSchema),
});

export const ConversationQuerySchema = z.object({
  customer: z.string().optional(),
  conversationId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  location: z.string().optional(),
  channel: ConversationChannelSchema.optional(),
  status: ConversationStatusSchema.optional(),
  billable: z.coerce.boolean().optional(),
  knowledgeGap: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const AgentConversationsListSchema = z.object({
  conversations: z.array(AgentConversationSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
  }),
});

export const ConversationLocationOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const AgentConversationLocationsSchema = z.object({
  locations: z.array(ConversationLocationOptionSchema),
});

export const AgentImproveListSchema = z.object({
  items: z.array(ImproveItemSchema),
});

export const AgentTestCasesListSchema = z.object({
  testCases: z.array(TestCaseSchema),
});

export const AgentTestRunsListSchema = z.object({
  testRuns: z.array(TestRunSchema),
});

export const PlaygroundMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  at: z.string(),
});

export const PlaygroundSessionSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  sessionNumber: z.number(),
  createdAt: z.string(),
  productionPrompt: z.string(),
  promptOverride: z.string().nullable(),
  effectivePrompt: z.string(),
  messages: z.array(PlaygroundMessageSchema),
});

export const UpdatePlaygroundSessionInputSchema = z.object({
  promptOverride: z.string().max(8000).nullable(),
});

export const SendPlaygroundMessageInputSchema = z.object({
  content: z.string().min(1).max(4000),
});

export const SendPlaygroundMessageResponseSchema = z.object({
  session: PlaygroundSessionSchema,
});

/** Internal fixture shape — not exposed by a single API endpoint */
export const AgentWorkspaceSchema = AgentCoreSchema.extend({
  settings: AgentSettingsSchema,
  analytics: AgentAnalyticsSchema,
  knowledge: AgentKnowledgeSchema,
  actions: z.array(AgentActionBindingSchema),
  procedures: z.array(AgentProcedureBindingSchema),
  webChat: WebChatConfigSchema,
  helpDesk: HelpDeskBindingSchema,
  deployChannels: z.record(z.string(), z.boolean()).default({}),
  conversations: z.array(AgentConversationSchema),
  improve: z.array(ImproveItemSchema),
  testCases: z.array(TestCaseSchema),
  testRuns: z.array(TestRunSchema),
});

export const AgentsListSchema = z.object({
  agents: z.array(AgentListItemSchema),
  planAgentLimit: z.number(),
});

export const CreateAgentInputSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(280).optional(),
});

export const UpdateAgentCoreInputSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(280).optional(),
  publish: z.boolean().optional(),
});

export const UpdateAgentSettingsInputSchema = z.object({
  settings: AgentSettingsSchema.partial(),
});

export const UpdateAgentKnowledgeInputSchema = z.object({
  knowledgeSourceId: z.string().optional(),
  knowledgeEnabled: z.boolean().optional(),
  addUrl: z.string().url().optional(),
  addFile: z
    .object({
      name: z.string().min(1),
    })
    .optional(),
  addQna: z
    .object({
      title: z.string().min(1),
      questions: z.array(z.string().min(1)).min(1),
      answer: z.string().min(1),
    })
    .optional(),
  knowledgeResourceAction: z
    .object({
      sourceId: z.string(),
      resourceIds: z.array(z.string()).min(1),
      action: z.enum(["train", "untrain", "remove"]),
    })
    .optional(),
});

export const UpdateAgentActionsInputSchema = z.object({
  actionId: z.string(),
  actionSubActionId: z.string(),
  actionSubActionEnabled: z.boolean(),
});

export const UpdateAgentProceduresInputSchema = z.object({
  procedureId: z.string(),
  procedureEnabled: z.boolean(),
});

export const UpdateAgentWebChatInputSchema = z.object({
  webChat: WebChatConfigSchema.partial(),
});

export const UpdateAgentHelpDeskInputSchema = z.object({
  useChannel: z.boolean(),
});

export const DeployChannelStatusSchema = z.enum([
  "active",
  "not_connected",
  "reauth_required",
  "coming_soon",
]);

export const DeployChannelSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  iconSlug: z.string(),
  enabled: z.boolean(),
  status: DeployChannelStatusSchema,
  connectorId: z.string().nullable(),
  connectSlug: z.string().nullable(),
  available: z.boolean(),
});

export const AgentDeployChannelsSchema = z.object({
  channels: z.array(DeployChannelSchema),
});

export const UpdateAgentDeployChannelInputSchema = z.object({
  channelId: z.string(),
  enabled: z.boolean(),
});

export type AgentStatus = z.infer<typeof AgentStatusSchema>;
export type AgentIcon = z.infer<typeof AgentIconSchema>;
export type ConversationChannel = z.infer<typeof ConversationChannelSchema>;
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;
export type AgentListItem = z.infer<typeof AgentListItemSchema>;
export type AgentSettings = z.infer<typeof AgentSettingsSchema>;
export type AgentAnalytics = z.infer<typeof AgentAnalyticsSchema>;
export type KnowledgeOptionKind = z.infer<typeof KnowledgeOptionKindSchema>;
export type KnowledgeResource = z.infer<typeof KnowledgeResourceSchema>;
export type KnowledgeSource = z.infer<typeof KnowledgeSourceSchema>;
export type AgentKnowledge = z.infer<typeof AgentKnowledgeSchema>;
export type AgentActionBinding = z.infer<typeof AgentActionBindingSchema>;
export type AgentProcedureBinding = z.infer<typeof AgentProcedureBindingSchema>;
export type WebChatConfig = z.infer<typeof WebChatConfigSchema>;
export type HelpDeskBinding = z.infer<typeof HelpDeskBindingSchema>;
export type DeployChannel = z.infer<typeof DeployChannelSchema>;
export type AgentDeployChannels = z.infer<typeof AgentDeployChannelsSchema>;
export type UpdateAgentDeployChannelInput = z.infer<
  typeof UpdateAgentDeployChannelInputSchema
>;
export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;
export type AgentConversation = z.infer<typeof AgentConversationSchema>;
export type ConversationQuery = z.infer<typeof ConversationQuerySchema>;
export type ImproveItem = z.infer<typeof ImproveItemSchema>;
export type ImproveKind = z.infer<typeof ImproveKindSchema>;
export type ImproveStatus = z.infer<typeof ImproveStatusSchema>;
export type TestCase = z.infer<typeof TestCaseSchema>;
export type TestRun = z.infer<typeof TestRunSchema>;
export type AgentActionsList = z.infer<typeof AgentActionsListSchema>;
export type AgentProceduresList = z.infer<typeof AgentProceduresListSchema>;
export type AgentConversationsList = z.infer<typeof AgentConversationsListSchema>;
export type ConversationLocationOption = z.infer<typeof ConversationLocationOptionSchema>;
export type AgentConversationLocations = z.infer<typeof AgentConversationLocationsSchema>;
export type AgentImproveList = z.infer<typeof AgentImproveListSchema>;
export type AgentTestCasesList = z.infer<typeof AgentTestCasesListSchema>;
export type AgentTestRunsList = z.infer<typeof AgentTestRunsListSchema>;
export type AgentCore = z.infer<typeof AgentCoreSchema>;
export type AgentWorkspace = z.infer<typeof AgentWorkspaceSchema>;
export type AgentsList = z.infer<typeof AgentsListSchema>;
export type PlaygroundMessage = z.infer<typeof PlaygroundMessageSchema>;
export type PlaygroundSession = z.infer<typeof PlaygroundSessionSchema>;
export type UpdatePlaygroundSessionInput = z.infer<
  typeof UpdatePlaygroundSessionInputSchema
>;
export type SendPlaygroundMessageInput = z.infer<
  typeof SendPlaygroundMessageInputSchema
>;
export type CreateAgentInput = z.infer<typeof CreateAgentInputSchema>;
export type UpdateAgentCoreInput = z.infer<typeof UpdateAgentCoreInputSchema>;
export type UpdateAgentSettingsInput = z.infer<typeof UpdateAgentSettingsInputSchema>;
export type UpdateAgentKnowledgeInput = z.infer<typeof UpdateAgentKnowledgeInputSchema>;
export type UpdateAgentActionsInput = z.infer<typeof UpdateAgentActionsInputSchema>;
export type UpdateAgentProceduresInput = z.infer<typeof UpdateAgentProceduresInputSchema>;
export type UpdateAgentWebChatInput = z.infer<typeof UpdateAgentWebChatInputSchema>;
export type UpdateAgentHelpDeskInput = z.infer<typeof UpdateAgentHelpDeskInputSchema>;
