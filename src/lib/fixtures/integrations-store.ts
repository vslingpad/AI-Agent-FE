import type {
  ConnectorDetail,
  ConnectSession,
  CreateConnectorInput,
  IntegrationCatalogItem,
  OrgConnector,
  UpdateConnectorInput,
} from "@/lib/schemas/integrations";
import { enrichConnector } from "@/lib/integrations/connector-paths";
import { mergeZendeskAuthConfig } from "@/lib/integrations/zendesk-auth";

export const INTEGRATION_CATALOG: IntegrationCatalogItem[] = [
  {
    slug: "zendesk",
    name: "Zendesk",
    description:
      "Connect Zendesk Messaging for channels, Help Center for knowledge, and Support actions.",
    capabilities: ["channel", "knowledge", "action"],
    knowledge_sub_capabilities: ["help_center", "tickets"],
    status: "active",
    available: true,
    sort_order: 10,
    config_fields: [
      {
        key: "subdomain",
        label: "Zendesk subdomain",
        type: "text",
        required: true,
        placeholder: "your-subdomain",
      },
    ],
    oauth_steps: [
      {
        id: "sunshine",
        label: "Messaging (Sunshine)",
        description:
          "Authorize read/write access for Zendesk Messaging channel.",
        required: true,
      },
      {
        id: "global_auth",
        label: "Support & Guide",
        description: "Authorize Help Center sync and Support ticket actions.",
        required: false,
      },
    ],
    action_highlights: [
      "Tag ticket",
      "Assign ticket",
      "Add internal note",
      "Pass control (Messaging)",
    ],
  },
  {
    slug: "calendly",
    name: "Calendly",
    description:
      "Let agents schedule meetings and look up availability via Calendly.",
    capabilities: ["action"],
    status: "active",
    available: true,
    sort_order: 20,
    config_fields: [],
    oauth_steps: [
      {
        id: "oauth",
        label: "Calendly OAuth",
        description: "Authorize access to your Calendly account and event types.",
        required: true,
      },
    ],
    action_highlights: [
      "Schedule meeting",
      "Check availability",
      "Cancel event",
    ],
  },
  {
    slug: "stripe",
    name: "Stripe",
    description:
      "Enable subscription lookups, billing actions, and customer portal links.",
    capabilities: ["action"],
    status: "active",
    available: true,
    sort_order: 30,
    config_fields: [
      {
        key: "mode",
        label: "Environment",
        type: "select",
        required: true,
        options: [
          { value: "live", label: "Live" },
          { value: "test", label: "Test" },
        ],
      },
    ],
    oauth_steps: [
      {
        id: "oauth",
        label: "Stripe Connect",
        description: "Authorize secure access to your Stripe account.",
        required: true,
      },
    ],
    action_highlights: [
      "Get subscription details",
      "Cancel subscription",
      "Pause subscription",
      "Resume subscription",
    ],
  },
  {
    slug: "freshdesk",
    name: "Freshdesk",
    description:
      "Create and update tickets, search solution articles, and add internal notes.",
    capabilities: ["channel", "knowledge", "action"],
    status: "active",
    available: false,
    sort_order: 40,
    config_fields: [
      {
        key: "subdomain",
        label: "Freshdesk domain",
        type: "text",
        required: true,
        placeholder: "acme",
      },
    ],
    oauth_steps: [
      {
        id: "oauth",
        label: "Freshdesk OAuth",
        description: "Authorize ticket and knowledge access for Freshdesk.",
        required: true,
      },
    ],
    action_highlights: [
      "Create and update tickets",
      "Search solution articles",
      "Add internal notes",
    ],
  },
  {
    slug: "intercom",
    name: "Intercom",
    description:
      "Look up conversations, tag contacts, and assign Inbox threads.",
    capabilities: ["channel", "knowledge", "action"],
    status: "active",
    available: false,
    sort_order: 50,
    config_fields: [],
    oauth_steps: [
      {
        id: "oauth",
        label: "Intercom OAuth",
        description: "Authorize Inbox, contacts, and Help Center access.",
        required: true,
      },
    ],
    action_highlights: [
      "Look up conversations",
      "Tag and assign contacts",
      "Search Help Center articles",
    ],
  },
  {
    slug: "hubspot",
    name: "HubSpot",
    description:
      "Look up CRM records, update tickets, and share customer context.",
    capabilities: ["channel", "knowledge", "action"],
    status: "active",
    available: false,
    sort_order: 60,
    config_fields: [],
    oauth_steps: [
      {
        id: "oauth",
        label: "HubSpot OAuth",
        description: "Authorize Service Hub tickets and CRM records.",
        required: true,
      },
    ],
    action_highlights: [
      "Look up contacts and companies",
      "Create and update tickets",
      "Search knowledge base articles",
    ],
  },
  {
    slug: "zoho_desk",
    name: "Zoho Desk",
    description:
      "Create tickets, update status, and search knowledge base articles.",
    capabilities: ["channel", "knowledge", "action"],
    status: "active",
    available: false,
    sort_order: 70,
    config_fields: [],
    oauth_steps: [
      {
        id: "oauth",
        label: "Zoho Desk OAuth",
        description: "Authorize Zoho Desk tickets and knowledge base access.",
        required: true,
      },
    ],
    action_highlights: [
      "Create and update tickets",
      "Assign departments",
      "Search knowledge base articles",
    ],
  },
  {
    slug: "shopify",
    name: "Shopify",
    description:
      "Look up orders, refunds, and fulfillment status from your store.",
    capabilities: ["action"],
    status: "active",
    available: false,
    sort_order: 80,
    config_fields: [
      {
        key: "shopDomain",
        label: "Shop domain",
        type: "text",
        required: true,
        placeholder: "acme.myshopify.com",
      },
    ],
    oauth_steps: [
      {
        id: "oauth",
        label: "Shopify OAuth",
        description: "Authorize order, customer, and fulfillment access.",
        required: true,
      },
    ],
    action_highlights: [
      "Look up order status",
      "Retrieve fulfillment and tracking",
      "Issue refunds",
    ],
  },
  {
    slug: "gorgias",
    name: "Gorgias",
    description:
      "Create helpdesk tickets and add internal notes during conversations.",
    capabilities: ["channel", "action"],
    status: "active",
    available: false,
    sort_order: 90,
    config_fields: [],
    oauth_steps: [
      {
        id: "oauth",
        label: "Gorgias OAuth",
        description: "Authorize Gorgias tickets and macros.",
        required: true,
      },
    ],
    action_highlights: [
      "Create and update tickets",
      "Add internal notes",
      "Apply macros",
    ],
  },
];

const DEFAULT_ORG_ID = "org_demo";

function createSeedConnectors(): OrgConnector[] {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const connectedAt = "2026-03-12T10:00:00.000Z";

  return [
    enrichConnector({
      id: "conn_zd_us",
      organization_id: DEFAULT_ORG_ID,
      integration_slug: "zendesk",
      display_name: "Zendesk — US Support",
      external_instance_id: "acme",
      capabilities: ["channel", "knowledge", "action"],
      enabled_capabilities: ["channel"],
      knowledge_sub_capabilities: ["help_center", "tickets"],
      enabled_knowledge_sub_capabilities: [],
      status: "active",
      sync_status: "synced",
      config: {
        subdomain: "acme",
        webhooks: { sunshine_id: "wh_sun_001" },
        auth: { sunshine: true, globalAuth: false },
      },
      routing_config: {
        defaultAgentId: null,
        rules: [],
      },
      reauth_required: false,
      reauth_scope: null,
      reauth_reason: null,
      last_synced_at: twoHoursAgo,
      last_sync_attempt_at: twoHoursAgo,
      connected_by: { name: "Sam Lee", connected_at: connectedAt },
      created_at: connectedAt,
      modified_at: twoHoursAgo,
    }),
    enrichConnector({
      id: "conn_cal_sales",
      organization_id: DEFAULT_ORG_ID,
      integration_slug: "calendly",
      display_name: "Calendly — Sales",
      external_instance_id: "sales@acme.com",
      capabilities: ["action"],
      enabled_capabilities: ["action"],
      status: "active",
      sync_status: "never",
      config: {
        defaultEventType: "/support-call",
        accountEmail: "sales@acme.com",
      },
      routing_config: {},
      reauth_required: false,
      reauth_scope: null,
      reauth_reason: null,
      last_synced_at: null,
      last_sync_attempt_at: null,
      connected_by: { name: "Sam Lee", connected_at: connectedAt },
      created_at: connectedAt,
      modified_at: connectedAt,
    }),
    enrichConnector({
      id: "conn_stripe_acme",
      organization_id: DEFAULT_ORG_ID,
      integration_slug: "stripe",
      display_name: "Stripe",
      external_instance_id: "acct_1acme",
      capabilities: ["action"],
      enabled_capabilities: ["action"],
      status: "active",
      sync_status: "never",
      config: {
        accountId: "acct_1acme....",
        mode: "live",
      },
      routing_config: {},
      reauth_required: false,
      reauth_scope: null,
      reauth_reason: null,
      last_synced_at: null,
      last_sync_attempt_at: null,
      connected_by: { name: "Sam Lee", connected_at: connectedAt },
      created_at: connectedAt,
      modified_at: connectedAt,
    }),
  ];
}

function buildConnectorDetail(connector: OrgConnector): ConnectorDetail {
  const base: ConnectorDetail = {
    ...connector,
    notification: null,
  };

  if (connector.integration_slug === "zendesk") {
    const auth = connector.config.auth as
      | { sunshine?: boolean; globalAuth?: boolean }
      | undefined;
    const globalAuthConnected = auth?.globalAuth ?? false;
    const actionsEnabled =
      connector.enabled_capabilities.includes("action") && globalAuthConnected;
    const knowledgeEnabled =
      connector.enabled_capabilities.includes("knowledge") &&
      globalAuthConnected;

    base.notification = !globalAuthConnected &&
      connector.enabled_capabilities.some(
        (cap) => cap === "knowledge" || cap === "action"
      )
      ? {
          type: "warning",
          message:
            "Support & Guide authorization is required for Knowledge and Actions. Complete Global Auth from the Overview tab.",
        }
      : connector.sync_status === "sync_failed" && knowledgeEnabled
        ? {
            type: "warning",
            message:
              "Help Center sync failed during the last attempt. Knowledge articles may be out of date until sync succeeds.",
          }
        : connector.reauth_required
          ? {
              type: "error",
              message:
                "Authorization expired. Reconnect to restore channel access.",
            }
          : null;

    base.channel = {
      webhook_status: "healthy",
      webhook_url:
        "https://hooks.nelto.ai/webhooks/zendesk/sunshine/conn_zd_us",
      sunshine_app_id: "5f8a9b2c1d3e4f5a",
      default_routing_agent: null,
      tag_rules: [
        { tag: "sales", agent_id: "agent_sales" },
        { tag: "billing", agent_id: "agent_billing" },
      ],
      messaging_enabled: connector.enabled_capabilities.includes("channel"),
    };

    base.knowledge = {
      collections: [
        {
          id: "hc_general",
          name: "General",
          article_count: 842,
          last_synced_at: connector.last_synced_at,
        },
        {
          id: "hc_billing",
          name: "Billing & Refunds",
          article_count: 362,
          last_synced_at: connector.last_synced_at,
        },
      ],
      articles: [
        {
          id: "art_001",
          title: "How to request a refund",
          category: "Billing & Refunds",
          status: "indexed",
          word_count: 420,
          last_trained_at: connector.last_synced_at,
        },
        {
          id: "art_002",
          title: "Shipping timelines and tracking",
          category: "General",
          status: "indexed",
          word_count: 310,
          last_trained_at: connector.last_synced_at,
        },
        {
          id: "art_003",
          title: "Enterprise SLA overview",
          category: "General",
          status: "failed",
          word_count: 890,
          last_trained_at: null,
        },
        {
          id: "art_004",
          title: "Updating payment method",
          category: "Billing & Refunds",
          status: "pending",
          word_count: 240,
          last_trained_at: null,
        },
      ],
      total_articles: 1204,
      indexed_articles: 1189,
    };

    base.actions = [
      {
        id: "zd_tag_ticket",
        name: "Tag ticket",
        description: "Add tags to a Support ticket during or after a conversation.",
        permission_granted: actionsEnabled,
        required_scope: "Zendesk Global Auth (read write)",
      },
      {
        id: "zd_assign_ticket",
        name: "Assign ticket",
        description: "Assign a ticket to a group or agent on escalation.",
        permission_granted: actionsEnabled,
        required_scope: "Zendesk Global Auth (read write)",
      },
      {
        id: "zd_internal_note",
        name: "Add internal note",
        description: "Post an internal note with AI summary on handover.",
        permission_granted: actionsEnabled,
        required_scope: "Zendesk Global Auth (read write)",
      },
      {
        id: "zd_pass_control",
        name: "Pass control (Messaging)",
        description: "Hand off a Messaging conversation to a human agent queue.",
        permission_granted: connector.enabled_capabilities.includes("channel"),
        required_scope: "Sunshine OAuth (messages:write)",
      },
    ];
  }

  if (connector.integration_slug === "calendly") {
    base.actions = [
      {
        id: "cal_schedule",
        name: "Schedule meeting",
        description: "Book a meeting using a configured event type.",
        permission_granted: true,
      },
      {
        id: "cal_availability",
        name: "Check availability",
        description: "Look up open slots for a given event type.",
        permission_granted: true,
      },
      {
        id: "cal_cancel",
        name: "Cancel event",
        description: "Cancel a scheduled Calendly event on behalf of the customer.",
        permission_granted: true,
      },
    ];
  }

  if (connector.integration_slug === "stripe") {
    base.actions = [
      {
        id: "stripe_lookup_sub",
        name: "Lookup subscription",
        description: "Retrieve subscription status and plan details.",
        permission_granted: true,
      },
      {
        id: "stripe_portal_link",
        name: "Customer portal link",
        description: "Generate a Stripe Customer Portal session link.",
        permission_granted: true,
      },
      {
        id: "stripe_refund",
        name: "Issue refund",
        description: "Process a refund — requires policy approval and confirmation.",
        permission_granted: false,
        required_scope: "Restricted — enable in Stripe connector policy",
      },
    ];
  }

  return base;
}

type WizardMode = "initial" | "global_auth";

type ConnectSessionRecord = ConnectSession & {
  organization_id: string;
  integration_slug: string;
  completedSteps: string[];
  wizardMode: WizardMode;
};

const orgConnectors = new Map<string, OrgConnector[]>();
const connectSessions = new Map<string, ConnectSessionRecord>();

function getOrgConnectors(orgId: string): OrgConnector[] {
  if (!orgConnectors.has(orgId)) {
    orgConnectors.set(
      orgId,
      createSeedConnectors().map((c) => ({
        ...c,
        organization_id: orgId,
      }))
    );
  }

  return orgConnectors.get(orgId)!;
}

function saveOrgConnectors(orgId: string, connectors: OrgConnector[]) {
  orgConnectors.set(orgId, connectors);
}

function findCatalogItem(slug: string): IntegrationCatalogItem | undefined {
  return INTEGRATION_CATALOG.find((item) => item.slug === slug);
}

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildWizardSteps(
  catalog: IntegrationCatalogItem,
  completedSteps: string[],
  mode: WizardMode = "initial"
) {
  if (catalog.slug === "zendesk") {
    const zendeskSteps =
      mode === "global_auth"
        ? catalog.oauth_steps.filter((step) => step.id === "global_auth")
        : catalog.oauth_steps.filter((step) => step.id === "sunshine");

    return zendeskSteps.map((step) => ({
      id: step.id,
      label: step.label,
      description: step.description,
      required: true,
      status: completedSteps.includes(step.id)
        ? ("complete" as const)
        : ("pending" as const),
    }));
  }

  return catalog.oauth_steps.map((step) => ({
    id: step.id,
    label: step.label,
    description: step.description,
    required: step.required,
    status: completedSteps.includes(step.id)
      ? ("complete" as const)
      : ("pending" as const),
  }));
}

function getNextStep(steps: ConnectSession["wizard"]["steps"]) {
  const pending = steps.find(
    (step) => step.status === "pending" || step.status === "in_progress"
  );

  return pending?.id ?? null;
}

function makeConnector(
  orgId: string,
  input: CreateConnectorInput,
  catalog: IntegrationCatalogItem,
  external_instance_id: string | null
): OrgConnector {
  const now = new Date().toISOString();

  return enrichConnector({
    id: generateId("conn"),
    organization_id: orgId,
    integration_slug: input.integration_slug,
    display_name: input.display_name,
    external_instance_id,
    capabilities: catalog.capabilities,
    enabled_capabilities: input.capabilities,
    knowledge_sub_capabilities: catalog.knowledge_sub_capabilities ?? [],
    enabled_knowledge_sub_capabilities: input.capabilities.includes("knowledge")
      ? [...(catalog.knowledge_sub_capabilities ?? [])]
      : [],
    status: "pending_oauth",
    sync_status: "never",
    config:
      input.integration_slug === "zendesk"
        ? {
            ...(input.config ?? {}),
            auth: { sunshine: false, globalAuth: false },
          }
        : (input.config ?? {}),
    routing_config: {},
    reauth_required: false,
    reauth_scope: null,
    reauth_reason: null,
    last_synced_at: null,
    last_sync_attempt_at: null,
    connected_by: { name: "You", connected_at: now },
    created_at: now,
    modified_at: now,
  });
}

export function getIntegrationsHub(orgId: string) {
  const connectors = getOrgConnectors(orgId).filter(
    (c) => c.status !== "disconnected"
  );

  return {
    catalog: INTEGRATION_CATALOG,
    connectors,
    plan_limit: 10,
    connected_count: connectors.length,
  };
}

export function getOrgConnector(orgId: string, connectorId: string) {
  return getOrgConnectors(orgId).find((c) => c.id === connectorId) ?? null;
}

export function getConnectorDetail(orgId: string, connectorId: string) {
  const connector = getOrgConnector(orgId, connectorId);

  if (!connector || connector.status === "disconnected") {
    return null;
  }

  return buildConnectorDetail(connector);
}

export function createOrgConnector(orgId: string, input: CreateConnectorInput) {
  const catalog = findCatalogItem(input.integration_slug);

  if (!catalog) {
    throw new Error("Unknown integration type");
  }

  const invalidCapabilities = input.capabilities.filter(
    (cap) => !catalog.capabilities.includes(cap)
  );

  if (invalidCapabilities.length > 0) {
    throw new Error("Invalid capabilities for this integration");
  }

  const external_instance_id =
    input.external_instance_id ??
    (input.config?.subdomain as string | undefined) ??
    null;

  const duplicate = getOrgConnectors(orgId).some(
    (c) =>
      c.integration_slug === input.integration_slug &&
      c.external_instance_id === external_instance_id &&
      c.status !== "disconnected"
  );

  if (duplicate && external_instance_id) {
    throw new Error(
      "An integration with this account already exists. Use a different instance or rename the existing one."
    );
  }

  const connect_session_id = generateId("cs");
  const connector = makeConnector(orgId, input, catalog, external_instance_id);

  const steps = buildWizardSteps(catalog, [], "initial");
  const currentStep = getNextStep(steps);

  const session: ConnectSessionRecord = {
    org_connector_id: connector.id,
    connect_session_id,
    organization_id: orgId,
    integration_slug: input.integration_slug,
    status: "pending_oauth",
    completedSteps: [],
    wizardMode: "initial",
    wizard: {
      current_step: currentStep,
      steps: steps.map((step) => ({
        ...step,
        status: step.id === currentStep ? "in_progress" : step.status,
      })),
    },
    authorize_url: currentStep
      ? `https://oauth.nelto.ai/${input.integration_slug}/${currentStep}?session=${connect_session_id}`
      : null,
  };

  const connectors = getOrgConnectors(orgId);
  connectors.push(connector);
  saveOrgConnectors(orgId, connectors);
  connectSessions.set(connect_session_id, session);

  return { connector, session };
}

export function completeOAuthStep(
  orgId: string,
  connectorId: string,
  connect_session_id: string,
  step_id: string
) {
  const session = connectSessions.get(connect_session_id);

  if (!session || session.org_connector_id !== connectorId) {
    throw new Error("Invalid connect session");
  }

  if (session.organization_id !== orgId) {
    throw new Error("Unauthorized");
  }

  const catalog = findCatalogItem(session.integration_slug);

  if (!catalog) {
    throw new Error("Unknown integration");
  }

  const connectors = getOrgConnectors(orgId);
  const connectorIndex = connectors.findIndex((c) => c.id === connectorId);

  if (connectorIndex === -1) {
    throw new Error("Connector not found");
  }

  const connector = connectors[connectorIndex]!;
  const completedSteps = [...session.completedSteps, step_id];
  const steps = buildWizardSteps(
    catalog,
    completedSteps,
    session.wizardMode
  );
  const currentStep = getNextStep(steps);
  const allComplete = steps.every((step) => step.status === "complete");

  const updatedSession: ConnectSessionRecord = {
    ...session,
    completedSteps,
    status: allComplete ? "active" : "pending_oauth",
    wizard: {
      current_step: currentStep,
      steps: steps.map((step) => {
        if (step.id === currentStep) {
          return { ...step, status: "in_progress" as const };
        }

        return step;
      }),
    },
    authorize_url: currentStep
      ? `https://oauth.nelto.ai/${session.integration_slug}/${currentStep}?session=${connect_session_id}`
      : null,
  };

  connectSessions.set(connect_session_id, updatedSession);

  const now = new Date().toISOString();
  let nextConfig = connector.config;

  if (connector.integration_slug === "zendesk") {
    if (step_id === "sunshine") {
      nextConfig = mergeZendeskAuthConfig(nextConfig, { sunshine: true });
    }

    if (step_id === "global_auth") {
      nextConfig = mergeZendeskAuthConfig(nextConfig, { globalAuth: true });
    }
  }

  const updatedConnector = enrichConnector({
    ...connector,
    config: nextConfig,
    status: allComplete ? "active" : connector.status === "active" ? "active" : "pending_oauth",
    reauth_required: allComplete && step_id === "global_auth" ? false : connector.reauth_required,
    sync_status:
      allComplete && session.wizardMode === "initial"
        ? "synced"
        : connector.sync_status,
    modified_at: now,
    last_synced_at: allComplete ? now : connector.last_synced_at,
    last_sync_attempt_at: allComplete ? now : connector.last_sync_attempt_at,
  });

  connectors[connectorIndex] = updatedConnector;
  saveOrgConnectors(orgId, connectors);

  return { connector: updatedConnector, session: updatedSession };
}

export function getConnectSession(connect_session_id: string) {
  return connectSessions.get(connect_session_id) ?? null;
}

export function updateOrgConnector(
  orgId: string,
  connectorId: string,
  input: UpdateConnectorInput
) {
  const connectors = getOrgConnectors(orgId);
  const index = connectors.findIndex((c) => c.id === connectorId);

  if (index === -1) {
    throw new Error("Connector not found");
  }

  const existing = connectors[index]!;
  const catalog = findCatalogItem(existing.integration_slug);

  if (input.enabled_capabilities && catalog) {
    const invalid = input.enabled_capabilities.filter(
      (cap) => !catalog.capabilities.includes(cap)
    );

    if (invalid.length > 0) {
      throw new Error("Invalid capabilities");
    }
  }

  if (input.enabled_knowledge_sub_capabilities && catalog) {
    const available = catalog.knowledge_sub_capabilities ?? [];
    const invalid = input.enabled_knowledge_sub_capabilities.filter(
      (cap) => !available.includes(cap)
    );

    if (invalid.length > 0) {
      throw new Error("Invalid knowledge sub-capabilities");
    }
  }

  const nextEnabledCapabilities =
    input.enabled_capabilities ?? existing.enabled_capabilities;
  const knowledgeEnabled = nextEnabledCapabilities.includes("knowledge");

  const updated = enrichConnector({
    ...existing,
    display_name: input.display_name ?? existing.display_name,
    enabled_capabilities: nextEnabledCapabilities,
    enabled_knowledge_sub_capabilities: knowledgeEnabled
      ? (input.enabled_knowledge_sub_capabilities ??
        existing.enabled_knowledge_sub_capabilities ??
        [])
      : [],
    config: input.config
      ? { ...existing.config, ...input.config }
      : existing.config,
    routing_config: input.routing_config
      ? { ...existing.routing_config, ...input.routing_config }
      : existing.routing_config,
    modified_at: new Date().toISOString(),
  });

  connectors[index] = updated;
  saveOrgConnectors(orgId, connectors);

  return updated;
}

export function deleteOrgConnector(orgId: string, connectorId: string) {
  const connectors = getOrgConnectors(orgId);
  const index = connectors.findIndex((c) => c.id === connectorId);

  if (index === -1) {
    throw new Error("Connector not found");
  }

  connectors[index] = enrichConnector({
    ...connectors[index]!,
    status: "disconnected",
    modified_at: new Date().toISOString(),
  });

  saveOrgConnectors(orgId, connectors);

  return { success: true };
}

export function startOAuthStep(
  orgId: string,
  connectorId: string,
  step_id: "global_auth" | "sunshine"
) {
  const connector = getOrgConnector(orgId, connectorId);

  if (!connector) {
    throw new Error("Connector not found");
  }

  const catalog = findCatalogItem(connector.integration_slug);

  if (!catalog) {
    throw new Error("Unknown integration");
  }

  const connect_session_id = generateId("cs");
  const wizardMode: WizardMode =
    step_id === "global_auth" ? "global_auth" : "initial";
  const steps = buildWizardSteps(catalog, [], wizardMode);
  const currentStep = step_id;

  const session: ConnectSessionRecord = {
    org_connector_id: connectorId,
    connect_session_id,
    organization_id: orgId,
    integration_slug: connector.integration_slug,
    status: "pending_oauth",
    completedSteps: [],
    wizardMode,
    wizard: {
      current_step: currentStep,
      steps: steps.map((step) => ({
        ...step,
        status:
          step.id === currentStep
            ? ("in_progress" as const)
            : ("pending" as const),
      })),
    },
    authorize_url: `https://oauth.nelto.ai/${connector.integration_slug}/${currentStep}?session=${connect_session_id}`,
  };

  connectSessions.set(connect_session_id, session);

  return session;
}

export function startReauth(orgId: string, connectorId: string) {
  const connector = getOrgConnector(orgId, connectorId);

  if (!connector) {
    throw new Error("Connector not found");
  }

  const scope = connector.reauth_scope ?? "sunshine";
  return startOAuthStep(
    orgId,
    connectorId,
    scope === "global_auth" ? "global_auth" : "sunshine"
  );
}
