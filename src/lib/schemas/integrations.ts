import { z } from "zod";

export const ConnectorCapabilitySchema = z.enum([
  "channel",
  "knowledge",
  "action",
]);

export const ConnectorStatusSchema = z.enum([
  "pending_oauth",
  "active",
  "reauth_required",
  "disconnected",
]);

export const SyncStatusSchema = z.enum([
  "synced",
  "sync_failed",
  "syncing",
  "never",
]);

export const OAuthStepStatusSchema = z.enum([
  "pending",
  "in_progress",
  "complete",
  "skipped",
]);

export const OAuthWizardStepSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean(),
  status: OAuthStepStatusSchema,
});

export const IntegrationCatalogItemSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  capabilities: z.array(ConnectorCapabilitySchema),
  status: z.enum(["active", "beta", "deprecated"]),
  sortOrder: z.number(),
  configFields: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(["text", "url", "select"]),
      required: z.boolean(),
      placeholder: z.string().optional(),
      options: z
        .array(z.object({ value: z.string(), label: z.string() }))
        .optional(),
    })
  ),
  oauthSteps: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      description: z.string(),
      required: z.boolean(),
    })
  ),
  actionHighlights: z.array(z.string()).default([]),
});

export const OrgConnectorSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  integrationSlug: z.string(),
  displayName: z.string(),
  externalInstanceId: z.string().nullable(),
  identifier: z.string(),
  capabilities: z.array(ConnectorCapabilitySchema),
  enabledCapabilities: z.array(ConnectorCapabilitySchema),
  status: ConnectorStatusSchema,
  syncStatus: SyncStatusSchema,
  config: z.record(z.string(), z.unknown()),
  routingConfig: z.record(z.string(), z.unknown()),
  reauthRequired: z.boolean(),
  reauthScope: z.string().nullable(),
  reauthReason: z.string().nullable(),
  lastSyncedAt: z.string().nullable(),
  lastSyncAttemptAt: z.string().nullable(),
  connectedBy: z.object({
    name: z.string(),
    connectedAt: z.string(),
  }),
  createdAt: z.string(),
  modifiedAt: z.string(),
});

export const ConnectorActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  permissionGranted: z.boolean(),
  requiredScope: z.string().optional(),
});

export const KnowledgeArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  status: z.enum(["indexed", "pending", "failed"]),
  wordCount: z.number(),
  lastTrainedAt: z.string().nullable(),
});

export const KnowledgeCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  articleCount: z.number(),
  lastSyncedAt: z.string().nullable(),
});

export const ChannelConfigSchema = z.object({
  webhookStatus: z.enum(["healthy", "degraded", "missing"]),
  webhookUrl: z.string().nullable(),
  sunshineAppId: z.string().nullable(),
  defaultRoutingAgent: z.string().nullable(),
  tagRules: z.array(
    z.object({
      tag: z.string(),
      agentId: z.string(),
    })
  ),
  messagingEnabled: z.boolean(),
});

export const ConnectorDetailSchema = OrgConnectorSchema.extend({
  notification: z
    .object({
      type: z.enum(["warning", "error", "info"]),
      message: z.string(),
    })
    .nullable(),
  knowledge: z
    .object({
      collections: z.array(KnowledgeCollectionSchema),
      articles: z.array(KnowledgeArticleSchema),
      totalArticles: z.number(),
      indexedArticles: z.number(),
    })
    .optional(),
  channel: ChannelConfigSchema.optional(),
  actions: z.array(ConnectorActionSchema).optional(),
});

export const ConnectSessionSchema = z.object({
  orgConnectorId: z.string(),
  connectSessionId: z.string(),
  status: ConnectorStatusSchema,
  wizard: z.object({
    currentStep: z.string().nullable(),
    steps: z.array(OAuthWizardStepSchema),
  }),
  authorizeUrl: z.string().nullable(),
});

export const IntegrationsHubSchema = z.object({
  catalog: z.array(IntegrationCatalogItemSchema),
  connectors: z.array(OrgConnectorSchema),
  planLimit: z.number().nullable(),
  connectedCount: z.number(),
});

export const CreateConnectorInputSchema = z.object({
  integrationSlug: z.string(),
  displayName: z.string().min(1).max(120),
  externalInstanceId: z.string().optional(),
  capabilities: z.array(ConnectorCapabilitySchema).min(1),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateConnectorInputSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  enabledCapabilities: z.array(ConnectorCapabilitySchema).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  routingConfig: z.record(z.string(), z.unknown()).optional(),
});

export const CompleteOAuthStepInputSchema = z.object({
  connectSessionId: z.string(),
  stepId: z.string(),
});

export const StartOAuthStepInputSchema = z.object({
  stepId: z.enum(["global_auth", "sunshine"]),
});

export type ConnectorCapability = z.infer<typeof ConnectorCapabilitySchema>;
export type ConnectorStatus = z.infer<typeof ConnectorStatusSchema>;
export type SyncStatus = z.infer<typeof SyncStatusSchema>;
export type IntegrationCatalogItem = z.infer<
  typeof IntegrationCatalogItemSchema
>;
export type OrgConnector = z.infer<typeof OrgConnectorSchema>;
export type ConnectorDetail = z.infer<typeof ConnectorDetailSchema>;
export type ConnectSession = z.infer<typeof ConnectSessionSchema>;
export type IntegrationsHub = z.infer<typeof IntegrationsHubSchema>;
export type CreateConnectorInput = z.infer<typeof CreateConnectorInputSchema>;
export type UpdateConnectorInput = z.infer<typeof UpdateConnectorInputSchema>;
export type ConnectorAction = z.infer<typeof ConnectorActionSchema>;
export type KnowledgeArticle = z.infer<typeof KnowledgeArticleSchema>;
