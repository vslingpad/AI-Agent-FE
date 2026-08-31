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
    knowledgeSubCapabilities: ["help_center", "tickets"],
    status: "active",
    sortOrder: 10,
    configFields: [
      {
        key: "subdomain",
        label: "Zendesk subdomain",
        type: "text",
        required: true,
        placeholder: "acme",
      },
    ],
    oauthSteps: [
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
    actionHighlights: [
      "Create and update support tickets",
      "Search Help Center articles",
      "Add internal notes to tickets",
    ],
  },
  {
    slug: "calendly",
    name: "Calendly",
    description:
      "Let agents schedule meetings and look up availability via Calendly.",
    capabilities: ["action"],
    status: "active",
    sortOrder: 20,
    configFields: [],
    oauthSteps: [
      {
        id: "oauth",
        label: "Calendly OAuth",
        description: "Authorize access to your Calendly account and event types.",
        required: true,
      },
    ],
    actionHighlights: [
      "Check available time slots",
      "Book a meeting",
      "Cancel or reschedule a booking",
    ],
  },
  {
    slug: "stripe",
    name: "Stripe",
    description:
      "Enable subscription lookups, billing actions, and customer portal links.",
    capabilities: ["action"],
    status: "active",
    sortOrder: 30,
    configFields: [
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
    oauthSteps: [
      {
        id: "oauth",
        label: "Stripe Connect",
        description: "Authorize secure access to your Stripe account.",
        required: true,
      },
    ],
    actionHighlights: [
      "Retrieve and display invoices",
      "Retrieve and display subscriptions",
      "Change customer information",
      "Manage subscriptions",
    ],
  },
  {
    slug: "freshdesk",
    name: "Freshdesk",
    description:
      "Create and update tickets, search solution articles, and add internal notes.",
    capabilities: ["channel", "knowledge", "action"],
    status: "active",
    sortOrder: 40,
    configFields: [
      {
        key: "subdomain",
        label: "Freshdesk domain",
        type: "text",
        required: true,
        placeholder: "acme",
      },
    ],
    oauthSteps: [
      {
        id: "oauth",
        label: "Freshdesk OAuth",
        description: "Authorize ticket and knowledge access for Freshdesk.",
        required: true,
      },
    ],
    actionHighlights: [
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
    sortOrder: 50,
    configFields: [],
    oauthSteps: [
      {
        id: "oauth",
        label: "Intercom OAuth",
        description: "Authorize Inbox, contacts, and Help Center access.",
        required: true,
      },
    ],
    actionHighlights: [
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
    sortOrder: 60,
    configFields: [],
    oauthSteps: [
      {
        id: "oauth",
        label: "HubSpot OAuth",
        description: "Authorize Service Hub tickets and CRM records.",
        required: true,
      },
    ],
    actionHighlights: [
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
    sortOrder: 70,
    configFields: [],
    oauthSteps: [
      {
        id: "oauth",
        label: "Zoho Desk OAuth",
        description: "Authorize Zoho Desk tickets and knowledge base access.",
        required: true,
      },
    ],
    actionHighlights: [
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
    sortOrder: 80,
    configFields: [
      {
        key: "shopDomain",
        label: "Shop domain",
        type: "text",
        required: true,
        placeholder: "acme.myshopify.com",
      },
    ],
    oauthSteps: [
      {
        id: "oauth",
        label: "Shopify OAuth",
        description: "Authorize order, customer, and fulfillment access.",
        required: true,
      },
    ],
    actionHighlights: [
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
    sortOrder: 90,
    configFields: [],
    oauthSteps: [
      {
        id: "oauth",
        label: "Gorgias OAuth",
        description: "Authorize Gorgias tickets and macros.",
        required: true,
      },
    ],
    actionHighlights: [
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
      organizationId: DEFAULT_ORG_ID,
      integrationSlug: "zendesk",
      displayName: "Zendesk — US Support",
      externalInstanceId: "acme",
      capabilities: ["channel", "knowledge", "action"],
      enabledCapabilities: ["channel"],
      knowledgeSubCapabilities: ["help_center", "tickets"],
      enabledKnowledgeSubCapabilities: [],
      status: "active",
      syncStatus: "synced",
      config: {
        subdomain: "acme",
        webhooks: { sunshine_id: "wh_sun_001" },
        auth: { sunshine: true, globalAuth: false },
      },
      routingConfig: {
        defaultAgentId: null,
        rules: [],
      },
      reauthRequired: false,
      reauthScope: null,
      reauthReason: null,
      lastSyncedAt: twoHoursAgo,
      lastSyncAttemptAt: twoHoursAgo,
      connectedBy: { name: "Sam Lee", connectedAt },
      createdAt: connectedAt,
      modifiedAt: twoHoursAgo,
    }),
    enrichConnector({
      id: "conn_cal_sales",
      organizationId: DEFAULT_ORG_ID,
      integrationSlug: "calendly",
      displayName: "Calendly — Sales",
      externalInstanceId: "sales@acme.com",
      capabilities: ["action"],
      enabledCapabilities: ["action"],
      status: "active",
      syncStatus: "never",
      config: {
        defaultEventType: "/support-call",
        accountEmail: "sales@acme.com",
      },
      routingConfig: {},
      reauthRequired: false,
      reauthScope: null,
      reauthReason: null,
      lastSyncedAt: null,
      lastSyncAttemptAt: null,
      connectedBy: { name: "Sam Lee", connectedAt },
      createdAt: connectedAt,
      modifiedAt: connectedAt,
    }),
    enrichConnector({
      id: "conn_stripe_acme",
      organizationId: DEFAULT_ORG_ID,
      integrationSlug: "stripe",
      displayName: "Stripe",
      externalInstanceId: "acct_1acme",
      capabilities: ["action"],
      enabledCapabilities: ["action"],
      status: "active",
      syncStatus: "never",
      config: {
        accountId: "acct_1acme....",
        mode: "live",
      },
      routingConfig: {},
      reauthRequired: false,
      reauthScope: null,
      reauthReason: null,
      lastSyncedAt: null,
      lastSyncAttemptAt: null,
      connectedBy: { name: "Sam Lee", connectedAt },
      createdAt: connectedAt,
      modifiedAt: connectedAt,
    }),
  ];
}

function buildConnectorDetail(connector: OrgConnector): ConnectorDetail {
  const base: ConnectorDetail = {
    ...connector,
    notification: null,
  };

  if (connector.integrationSlug === "zendesk") {
    const auth = connector.config.auth as
      | { sunshine?: boolean; globalAuth?: boolean }
      | undefined;
    const globalAuthConnected = auth?.globalAuth ?? false;
    const actionsEnabled =
      connector.enabledCapabilities.includes("action") && globalAuthConnected;
    const knowledgeEnabled =
      connector.enabledCapabilities.includes("knowledge") &&
      globalAuthConnected;

    base.notification = !globalAuthConnected &&
      connector.enabledCapabilities.some(
        (cap) => cap === "knowledge" || cap === "action"
      )
      ? {
          type: "warning",
          message:
            "Support & Guide authorization is required for Knowledge and Actions. Complete Global Auth from the Overview tab.",
        }
      : connector.syncStatus === "sync_failed" && knowledgeEnabled
        ? {
            type: "warning",
            message:
              "Help Center sync failed during the last attempt. Knowledge articles may be out of date until sync succeeds.",
          }
        : connector.reauthRequired
          ? {
              type: "error",
              message:
                "Authorization expired. Reconnect to restore channel access.",
            }
          : null;

    base.channel = {
      webhookStatus: "healthy",
      webhookUrl:
        "https://hooks.lingpad.ai/webhooks/zendesk/sunshine/conn_zd_us",
      sunshineAppId: "5f8a9b2c1d3e4f5a",
      defaultRoutingAgent: null,
      tagRules: [
        { tag: "sales", agentId: "agent_sales" },
        { tag: "billing", agentId: "agent_billing" },
      ],
      messagingEnabled: connector.enabledCapabilities.includes("channel"),
    };

    base.knowledge = {
      collections: [
        {
          id: "hc_general",
          name: "General",
          articleCount: 842,
          lastSyncedAt: connector.lastSyncedAt,
        },
        {
          id: "hc_billing",
          name: "Billing & Refunds",
          articleCount: 362,
          lastSyncedAt: connector.lastSyncedAt,
        },
      ],
      articles: [
        {
          id: "art_001",
          title: "How to request a refund",
          category: "Billing & Refunds",
          status: "indexed",
          wordCount: 420,
          lastTrainedAt: connector.lastSyncedAt,
        },
        {
          id: "art_002",
          title: "Shipping timelines and tracking",
          category: "General",
          status: "indexed",
          wordCount: 310,
          lastTrainedAt: connector.lastSyncedAt,
        },
        {
          id: "art_003",
          title: "Enterprise SLA overview",
          category: "General",
          status: "failed",
          wordCount: 890,
          lastTrainedAt: null,
        },
        {
          id: "art_004",
          title: "Updating payment method",
          category: "Billing & Refunds",
          status: "pending",
          wordCount: 240,
          lastTrainedAt: null,
        },
      ],
      totalArticles: 1204,
      indexedArticles: 1189,
    };

    base.actions = [
      {
        id: "zd_tag_ticket",
        name: "Tag ticket",
        description: "Add tags to a Support ticket during or after a conversation.",
        permissionGranted: actionsEnabled,
        requiredScope: "Zendesk Global Auth (read write)",
      },
      {
        id: "zd_assign_ticket",
        name: "Assign ticket",
        description: "Assign a ticket to a group or agent on escalation.",
        permissionGranted: actionsEnabled,
        requiredScope: "Zendesk Global Auth (read write)",
      },
      {
        id: "zd_internal_note",
        name: "Add internal note",
        description: "Post an internal note with AI summary on handover.",
        permissionGranted: actionsEnabled,
        requiredScope: "Zendesk Global Auth (read write)",
      },
      {
        id: "zd_pass_control",
        name: "Pass control (Messaging)",
        description: "Hand off a Messaging conversation to a human agent queue.",
        permissionGranted: connector.enabledCapabilities.includes("channel"),
        requiredScope: "Sunshine OAuth (messages:write)",
      },
    ];
  }

  if (connector.integrationSlug === "calendly") {
    base.actions = [
      {
        id: "cal_schedule",
        name: "Schedule meeting",
        description: "Book a meeting using a configured event type.",
        permissionGranted: true,
      },
      {
        id: "cal_availability",
        name: "Check availability",
        description: "Look up open slots for a given event type.",
        permissionGranted: true,
      },
      {
        id: "cal_cancel",
        name: "Cancel event",
        description: "Cancel a scheduled Calendly event on behalf of the customer.",
        permissionGranted: true,
      },
    ];
  }

  if (connector.integrationSlug === "stripe") {
    base.actions = [
      {
        id: "stripe_lookup_sub",
        name: "Lookup subscription",
        description: "Retrieve subscription status and plan details.",
        permissionGranted: true,
      },
      {
        id: "stripe_portal_link",
        name: "Customer portal link",
        description: "Generate a Stripe Customer Portal session link.",
        permissionGranted: true,
      },
      {
        id: "stripe_refund",
        name: "Issue refund",
        description: "Process a refund — requires policy approval and confirmation.",
        permissionGranted: false,
        requiredScope: "Restricted — enable in Stripe connector policy",
      },
    ];
  }

  return base;
}

type WizardMode = "initial" | "global_auth";

type ConnectSessionRecord = ConnectSession & {
  organizationId: string;
  integrationSlug: string;
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
        organizationId: orgId,
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
        ? catalog.oauthSteps.filter((step) => step.id === "global_auth")
        : catalog.oauthSteps.filter((step) => step.id === "sunshine");

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

  return catalog.oauthSteps.map((step) => ({
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
  externalInstanceId: string | null
): OrgConnector {
  const now = new Date().toISOString();

  return enrichConnector({
    id: generateId("conn"),
    organizationId: orgId,
    integrationSlug: input.integrationSlug,
    displayName: input.displayName,
    externalInstanceId,
    capabilities: catalog.capabilities,
    enabledCapabilities: input.capabilities,
    knowledgeSubCapabilities: catalog.knowledgeSubCapabilities ?? [],
    enabledKnowledgeSubCapabilities: input.capabilities.includes("knowledge")
      ? [...(catalog.knowledgeSubCapabilities ?? [])]
      : [],
    status: "pending_oauth",
    syncStatus: "never",
    config:
      input.integrationSlug === "zendesk"
        ? {
            ...(input.config ?? {}),
            auth: { sunshine: false, globalAuth: false },
          }
        : (input.config ?? {}),
    routingConfig: {},
    reauthRequired: false,
    reauthScope: null,
    reauthReason: null,
    lastSyncedAt: null,
    lastSyncAttemptAt: null,
    connectedBy: { name: "You", connectedAt: now },
    createdAt: now,
    modifiedAt: now,
  });
}

export function getIntegrationsHub(orgId: string) {
  const connectors = getOrgConnectors(orgId).filter(
    (c) => c.status !== "disconnected"
  );

  return {
    catalog: INTEGRATION_CATALOG,
    connectors,
    planLimit: 10,
    connectedCount: connectors.length,
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
  const catalog = findCatalogItem(input.integrationSlug);

  if (!catalog) {
    throw new Error("Unknown integration type");
  }

  const invalidCapabilities = input.capabilities.filter(
    (cap) => !catalog.capabilities.includes(cap)
  );

  if (invalidCapabilities.length > 0) {
    throw new Error("Invalid capabilities for this integration");
  }

  const externalInstanceId =
    input.externalInstanceId ??
    (input.config?.subdomain as string | undefined) ??
    null;

  const duplicate = getOrgConnectors(orgId).some(
    (c) =>
      c.integrationSlug === input.integrationSlug &&
      c.externalInstanceId === externalInstanceId &&
      c.status !== "disconnected"
  );

  if (duplicate && externalInstanceId) {
    throw new Error(
      "An integration with this account already exists. Use a different instance or rename the existing one."
    );
  }

  const connectSessionId = generateId("cs");
  const connector = makeConnector(orgId, input, catalog, externalInstanceId);

  const steps = buildWizardSteps(catalog, [], "initial");
  const currentStep = getNextStep(steps);

  const session: ConnectSessionRecord = {
    orgConnectorId: connector.id,
    connectSessionId,
    organizationId: orgId,
    integrationSlug: input.integrationSlug,
    status: "pending_oauth",
    completedSteps: [],
    wizardMode: "initial",
    wizard: {
      currentStep,
      steps: steps.map((step) => ({
        ...step,
        status: step.id === currentStep ? "in_progress" : step.status,
      })),
    },
    authorizeUrl: currentStep
      ? `https://oauth.lingpad.ai/${input.integrationSlug}/${currentStep}?session=${connectSessionId}`
      : null,
  };

  const connectors = getOrgConnectors(orgId);
  connectors.push(connector);
  saveOrgConnectors(orgId, connectors);
  connectSessions.set(connectSessionId, session);

  return { connector, session };
}

export function completeOAuthStep(
  orgId: string,
  connectorId: string,
  connectSessionId: string,
  stepId: string
) {
  const session = connectSessions.get(connectSessionId);

  if (!session || session.orgConnectorId !== connectorId) {
    throw new Error("Invalid connect session");
  }

  if (session.organizationId !== orgId) {
    throw new Error("Unauthorized");
  }

  const catalog = findCatalogItem(session.integrationSlug);

  if (!catalog) {
    throw new Error("Unknown integration");
  }

  const connectors = getOrgConnectors(orgId);
  const connectorIndex = connectors.findIndex((c) => c.id === connectorId);

  if (connectorIndex === -1) {
    throw new Error("Connector not found");
  }

  const connector = connectors[connectorIndex]!;
  const completedSteps = [...session.completedSteps, stepId];
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
      currentStep,
      steps: steps.map((step) => {
        if (step.id === currentStep) {
          return { ...step, status: "in_progress" as const };
        }

        return step;
      }),
    },
    authorizeUrl: currentStep
      ? `https://oauth.lingpad.ai/${session.integrationSlug}/${currentStep}?session=${connectSessionId}`
      : null,
  };

  connectSessions.set(connectSessionId, updatedSession);

  const now = new Date().toISOString();
  let nextConfig = connector.config;

  if (connector.integrationSlug === "zendesk") {
    if (stepId === "sunshine") {
      nextConfig = mergeZendeskAuthConfig(nextConfig, { sunshine: true });
    }

    if (stepId === "global_auth") {
      nextConfig = mergeZendeskAuthConfig(nextConfig, { globalAuth: true });
    }
  }

  const updatedConnector = enrichConnector({
    ...connector,
    config: nextConfig,
    status: allComplete ? "active" : connector.status === "active" ? "active" : "pending_oauth",
    reauthRequired: allComplete && stepId === "global_auth" ? false : connector.reauthRequired,
    syncStatus:
      allComplete && session.wizardMode === "initial"
        ? "synced"
        : connector.syncStatus,
    modifiedAt: now,
    lastSyncedAt: allComplete ? now : connector.lastSyncedAt,
    lastSyncAttemptAt: allComplete ? now : connector.lastSyncAttemptAt,
  });

  connectors[connectorIndex] = updatedConnector;
  saveOrgConnectors(orgId, connectors);

  return { connector: updatedConnector, session: updatedSession };
}

export function getConnectSession(connectSessionId: string) {
  return connectSessions.get(connectSessionId) ?? null;
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
  const catalog = findCatalogItem(existing.integrationSlug);

  if (input.enabledCapabilities && catalog) {
    const invalid = input.enabledCapabilities.filter(
      (cap) => !catalog.capabilities.includes(cap)
    );

    if (invalid.length > 0) {
      throw new Error("Invalid capabilities");
    }
  }

  if (input.enabledKnowledgeSubCapabilities && catalog) {
    const available = catalog.knowledgeSubCapabilities ?? [];
    const invalid = input.enabledKnowledgeSubCapabilities.filter(
      (cap) => !available.includes(cap)
    );

    if (invalid.length > 0) {
      throw new Error("Invalid knowledge sub-capabilities");
    }
  }

  const nextEnabledCapabilities =
    input.enabledCapabilities ?? existing.enabledCapabilities;
  const knowledgeEnabled = nextEnabledCapabilities.includes("knowledge");

  const updated = enrichConnector({
    ...existing,
    displayName: input.displayName ?? existing.displayName,
    enabledCapabilities: nextEnabledCapabilities,
    enabledKnowledgeSubCapabilities: knowledgeEnabled
      ? (input.enabledKnowledgeSubCapabilities ??
        existing.enabledKnowledgeSubCapabilities ??
        [])
      : [],
    config: input.config
      ? { ...existing.config, ...input.config }
      : existing.config,
    routingConfig: input.routingConfig
      ? { ...existing.routingConfig, ...input.routingConfig }
      : existing.routingConfig,
    modifiedAt: new Date().toISOString(),
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
    modifiedAt: new Date().toISOString(),
  });

  saveOrgConnectors(orgId, connectors);

  return { success: true };
}

export function startOAuthStep(
  orgId: string,
  connectorId: string,
  stepId: "global_auth" | "sunshine"
) {
  const connector = getOrgConnector(orgId, connectorId);

  if (!connector) {
    throw new Error("Connector not found");
  }

  const catalog = findCatalogItem(connector.integrationSlug);

  if (!catalog) {
    throw new Error("Unknown integration");
  }

  const connectSessionId = generateId("cs");
  const wizardMode: WizardMode =
    stepId === "global_auth" ? "global_auth" : "initial";
  const steps = buildWizardSteps(catalog, [], wizardMode);
  const currentStep = stepId;

  const session: ConnectSessionRecord = {
    orgConnectorId: connectorId,
    connectSessionId,
    organizationId: orgId,
    integrationSlug: connector.integrationSlug,
    status: "pending_oauth",
    completedSteps: [],
    wizardMode,
    wizard: {
      currentStep,
      steps: steps.map((step) => ({
        ...step,
        status:
          step.id === currentStep
            ? ("in_progress" as const)
            : ("pending" as const),
      })),
    },
    authorizeUrl: `https://oauth.lingpad.ai/${connector.integrationSlug}/${currentStep}?session=${connectSessionId}`,
  };

  connectSessions.set(connectSessionId, session);

  return session;
}

export function startReauth(orgId: string, connectorId: string) {
  const connector = getOrgConnector(orgId, connectorId);

  if (!connector) {
    throw new Error("Connector not found");
  }

  const scope = connector.reauthScope ?? "sunshine";
  return startOAuthStep(
    orgId,
    connectorId,
    scope === "global_auth" ? "global_auth" : "sunshine"
  );
}
