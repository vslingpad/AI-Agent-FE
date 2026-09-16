import { z } from "zod";

export const ConnectorCapabilitySchema = z.enum([
  "channel",
  "knowledge",
  "action",
]);

export const KnowledgeSubCapabilitySchema = z.enum(["help_center", "tickets"]);

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
  integration_family: z.string().nullish(),
  knowledge_sub_capabilities: z.array(KnowledgeSubCapabilitySchema).optional(),
  status: z.enum(["active", "beta", "deprecated"]),
  available: z.boolean().default(false),
  sort_order: z.number(),
  config_fields: z.array(
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
  oauth_steps: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      description: z.string(),
      required: z.boolean(),
    })
  ),
  action_highlights: z.array(z.string()).default([]),
});

export const OrgConnectorSchema = z.object({
  id: z.string(),
  organization_id: z.string(),
  integration_slug: z.string(),
  display_name: z.string(),
  external_instance_id: z.string().nullable(),
  identifier: z.string(),
  capabilities: z.array(ConnectorCapabilitySchema),
  enabled_capabilities: z.array(ConnectorCapabilitySchema),
  knowledge_sub_capabilities: z.array(KnowledgeSubCapabilitySchema).optional(),
  enabled_knowledge_sub_capabilities: z
    .array(KnowledgeSubCapabilitySchema)
    .optional(),
  status: ConnectorStatusSchema,
  sync_status: SyncStatusSchema,
  config: z.record(z.string(), z.unknown()),
  routing_config: z.record(z.string(), z.unknown()),
  reauth_required: z.boolean(),
  reauth_scope: z.string().nullable(),
  reauth_reason: z.string().nullable(),
  last_synced_at: z.string().nullable(),
  last_sync_attempt_at: z.string().nullable(),
  connected_by: z.object({
    name: z.string(),
    connected_at: z.string(),
  }),
  created_at: z.string(),
  modified_at: z.string(),
});

export const ConnectorActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  permission_granted: z.boolean(),
  required_scope: z.string().nullish(),
});

export const KnowledgeArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  status: z.enum(["indexed", "pending", "failed"]),
  word_count: z.number(),
  last_trained_at: z.string().nullable(),
});

export const KnowledgeCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  article_count: z.number(),
  last_synced_at: z.string().nullable(),
});

export const ChannelTagRuleSchema = z.object({
  tag: z.string(),
  agent_id: z.coerce.string(),
});

export const ChannelConfigSchema = z.object({
  webhook_status: z.enum(["healthy", "degraded", "missing"]),
  webhook_url: z.string().nullable(),
  sunshine_app_id: z.coerce.string().nullable(),
  default_routing_agent: z.coerce.string().nullable(),
  tag_rules: z.array(ChannelTagRuleSchema),
  messaging_enabled: z.boolean(),
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
      total_articles: z.number(),
      indexed_articles: z.number(),
    })
    .nullish(),
  channel: ChannelConfigSchema.nullish(),
  actions: z.array(ConnectorActionSchema).nullish(),
});

export const ConnectSessionSchema = z.object({
  org_connector_id: z.string(),
  connect_session_id: z.string(),
  status: ConnectorStatusSchema,
  wizard: z.object({
    current_step: z.string().nullable(),
    steps: z.array(OAuthWizardStepSchema),
  }),
  authorize_url: z.string().nullable(),
});

export const IntegrationsHubSchema = z.object({
  catalog: z.array(IntegrationCatalogItemSchema),
  connectors: z.array(OrgConnectorSchema),
  plan_limit: z.number().nullable(),
  connected_count: z.number(),
});

export const CreateConnectorInputSchema = z.object({
  integration_slug: z.string(),
  display_name: z.string().min(1).max(120),
  external_instance_id: z.string().optional(),
  capabilities: z.array(ConnectorCapabilitySchema).min(1),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateConnectorInputSchema = z.object({
  display_name: z.string().min(1).max(120).optional(),
  enabled_capabilities: z.array(ConnectorCapabilitySchema).optional(),
  enabled_knowledge_sub_capabilities: z
    .array(KnowledgeSubCapabilitySchema)
    .optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  routing_config: z.record(z.string(), z.unknown()).optional(),
});

export const CompleteOAuthStepInputSchema = z.object({
  connect_session_id: z.string(),
  step_id: z.string(),
});

export const StartOAuthStepInputSchema = z.object({
  step_id: z.enum(["global_auth", "sunshine"]),
});

export type ConnectorCapability = z.infer<typeof ConnectorCapabilitySchema>;
export type KnowledgeSubCapability = z.infer<typeof KnowledgeSubCapabilitySchema>;
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
