import type {
  AgentListItem,
  AgentCore,
  AgentWorkspace,
  AgentsList,
  CreateAgentInput,
  ImproveItem,
  KnowledgeSource,
  UpdateAgentSettingsInput,
} from "@/lib/schemas/agents";
import { nativeSourceId } from "@/lib/knowledge/catalog";
import { templateSubActions } from "@/lib/actions/agent-action-catalog";

const DEFAULT_ORG_ID = "org_demo";

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number) {
  return hoursAgo(days * 24);
}

function spark(start: number, step: number) {
  return Array.from({ length: 12 }, (_, index) =>
    Math.round((start + index * step + (index % 3) * 2) * 10) / 10
  );
}

function ticketsSeries() {
  return Array.from({ length: 14 }, (_, index) => {
    const day = index + 12;
    return {
      date: `2026-08-${String(day).padStart(2, "0")}`,
      label: `Aug ${day}`,
      value: 18 + index * 2 + (index % 4) * 3,
    };
  });
}

function cloneWorkspace(workspace: AgentWorkspace): AgentWorkspace {
  return structuredClone(workspace);
}

function defaultPrompt(name: string) {
  return `You are ${name}, a support agent for Acme. Answer from the knowledge base. If you cannot help, transfer to a human. Be concise, accurate, and never invent policy.`;
}

function defaultHandover(): AgentWorkspace["settings"]["handover"] {
  return {
    mode: "helpdesk",
    connectorId: "conn_zd_us",
    team: "Support",
    tags: "ai_escalated",
    includeAiSummary: true,
    email: "support@acme.com",
    contactUrl: "https://acme.com/contact",
    handoffMessage: "Connecting you with our support team. They’ll pick this up shortly.",
  };
}

function knowledgeSources(options: {
  nativeEnabled: boolean;
  zendeskHelpCenter: boolean;
  zendeskTickets: boolean;
}): KnowledgeSource[] {
  const urls: KnowledgeSource["resources"] = [
    {
      type: "url",
      id: "url_help",
      url: "https://help.acme.com",
      title: "Acme Help Center",
      status: "indexed",
      pageCount: 86,
      updatedAt: hoursAgo(2),
      addedBy: "Alex Morgan",
      trained: true,
    },
    {
      type: "url",
      id: "url_status",
      url: "https://status.acme.com",
      title: "Status page",
      status: "indexed",
      pageCount: 4,
      updatedAt: hoursAgo(8),
      addedBy: "Alex Morgan",
      trained: true,
    },
  ];

  const files: KnowledgeSource["resources"] = [
    {
      type: "file",
      id: "file_refunds",
      name: "Refund policy.pdf",
      sizeLabel: "420 KB",
      status: "indexed",
      updatedAt: hoursAgo(4),
      addedBy: "Jordan Lee",
      trained: true,
    },
    {
      type: "file",
      id: "file_shipping",
      name: "Shipping SLAs.pdf",
      sizeLabel: "188 KB",
      status: "indexed",
      updatedAt: daysAgo(1),
      addedBy: "Jordan Lee",
      trained: true,
    },
    {
      type: "file",
      id: "file_returns",
      name: "Returns playbook.pdf",
      sizeLabel: "256 KB",
      status: "processing",
      updatedAt: hoursAgo(1),
      addedBy: "Alex Morgan",
      trained: false,
    },
  ];

  const qna: KnowledgeSource["resources"] = [
    {
      type: "qna",
      id: "qna_1",
      question: "How long do refunds take?",
      answer: "Refunds are issued within 5–7 business days after approval.",
      updatedAt: daysAgo(2),
      addedBy: "Sam Patel",
      trained: true,
    },
    {
      type: "qna",
      id: "qna_2",
      question: "Do you ship internationally?",
      answer: "Yes, to 32 countries. Delivery is 5–12 business days.",
      updatedAt: daysAgo(3),
      addedBy: "Sam Patel",
      trained: false,
    },
  ];

  const articles: KnowledgeSource["resources"] = [
    {
      type: "article",
      id: "art_001",
      title: "How to request a refund",
      collection: "Billing & Refunds",
      status: "indexed",
      updatedAt: hoursAgo(2),
      trained: true,
    },
    {
      type: "article",
      id: "art_002",
      title: "Track your order",
      collection: "General",
      status: "indexed",
      updatedAt: hoursAgo(2),
      trained: true,
    },
    {
      type: "article",
      id: "art_003",
      title: "International shipping",
      collection: "General",
      status: "pending",
      updatedAt: hoursAgo(6),
      trained: false,
    },
  ];

  const tickets: KnowledgeSource["resources"] = [
    {
      type: "ticket",
      id: "tkt_48219",
      subject: "Damaged shipment — order 48219",
      ticketStatus: "solved",
      updatedAt: hoursAgo(6),
      trained: true,
    },
    {
      type: "ticket",
      id: "tkt_11902",
      subject: "Where is my package?",
      ticketStatus: "solved",
      updatedAt: hoursAgo(12),
      trained: true,
    },
    {
      type: "ticket",
      id: "tkt_33011",
      subject: "Refund window for sale items",
      ticketStatus: "solved",
      updatedAt: daysAgo(2),
      trained: false,
    },
  ];

  return [
    {
      id: nativeSourceId("website"),
      slug: "website",
      name: "Website",
      kind: "website",
      vendorSlug: null,
      state: "connected",
      enabled: options.nativeEnabled,
      instanceName: null,
      lastSyncedAt: hoursAgo(1),
      collections: [],
      resources: urls,
    },
    {
      id: nativeSourceId("files"),
      slug: "files",
      name: "Uploaded files",
      kind: "files",
      vendorSlug: null,
      state: "connected",
      enabled: options.nativeEnabled,
      instanceName: null,
      lastSyncedAt: hoursAgo(1),
      collections: [],
      resources: files,
    },
    {
      id: nativeSourceId("qna"),
      slug: "qna",
      name: "Q&A",
      kind: "qna",
      vendorSlug: null,
      state: "connected",
      enabled: options.nativeEnabled,
      instanceName: null,
      lastSyncedAt: hoursAgo(1),
      collections: [],
      resources: qna,
    },
    {
      id: "src_zendesk_help_center",
      slug: "zendesk-help-center",
      name: "Zendesk Help Center",
      kind: "help_center",
      vendorSlug: "zendesk",
      state: "connected",
      enabled: options.zendeskHelpCenter,
      instanceName: "US Support",
      lastSyncedAt: hoursAgo(2),
      collections: [
        { id: "hc_general", name: "General", articleCount: 842 },
        { id: "hc_billing", name: "Billing & Refunds", articleCount: 362 },
      ],
      resources: articles,
    },
    {
      id: "src_zendesk_tickets",
      slug: "zendesk-tickets",
      name: "Zendesk Tickets",
      kind: "tickets",
      vendorSlug: "zendesk",
      state: "connected",
      enabled: options.zendeskTickets,
      instanceName: "US Support",
      lastSyncedAt: hoursAgo(6),
      collections: [],
      resources: tickets,
    },
  ];
}

function defaultActions(enabled: {
  zendesk?: Record<string, boolean>;
  calendly?: Record<string, boolean>;
  stripe?: Record<string, boolean>;
  custom?: Record<string, boolean>;
}): AgentWorkspace["actions"] {
  return [
    {
      id: "act_zendesk",
      connectorId: "conn_zd_us",
      slug: "zendesk",
      name: "Zendesk — US Support",
      identifier: "support.acme.zendesk.com",
      kind: "connector",
      description: "Create tickets, add notes, and search Help Center.",
      connected: true,
      subActions: templateSubActions("zendesk", {
        zd_tag_ticket: enabled.zendesk?.zd_tag_ticket ?? false,
        zd_assign_ticket: enabled.zendesk?.zd_assign_ticket ?? false,
        zd_internal_note: enabled.zendesk?.zd_internal_note ?? true,
        zd_pass_control: enabled.zendesk?.zd_pass_control ?? false,
      }),
    },
    {
      id: "act_calendly",
      connectorId: "conn_cal_sales",
      slug: "calendly",
      name: "Calendly — Sales",
      identifier: "sales@acme.com",
      kind: "connector",
      description: "Check availability and book support calls.",
      connected: true,
      subActions: templateSubActions("calendly", {
        cal_schedule: enabled.calendly?.cal_schedule ?? true,
        cal_availability: enabled.calendly?.cal_availability ?? true,
        cal_cancel: enabled.calendly?.cal_cancel ?? false,
      }),
    },
    {
      id: "act_stripe",
      connectorId: "conn_stripe_acme",
      slug: "stripe",
      name: "Stripe",
      identifier: "acct_1AcmeDemo",
      kind: "connector",
      description: "Look up invoices, subscriptions, and portal links.",
      connected: true,
      subActions: templateSubActions("stripe", {
        stripe_lookup_sub: enabled.stripe?.stripe_lookup_sub ?? true,
        stripe_portal_link: enabled.stripe?.stripe_portal_link ?? true,
        stripe_refund: enabled.stripe?.stripe_refund ?? false,
      }),
    },
    {
      id: "act_custom",
      connectorId: null,
      slug: "custom_actions",
      name: "Custom actions",
      identifier: "Org-defined HTTP APIs",
      kind: "custom_tool",
      description: "Org-defined HTTP APIs this agent can call.",
      connected: true,
      subActions: [
        {
          id: "tool_order_lookup",
          name: "Order Lookup",
          description: "Returns status and tracking for an order.",
          enabled: enabled.custom?.tool_order_lookup ?? false,
        },
        {
          id: "tool_create_refund",
          name: "Create Refund",
          description: "Issues a refund, capped at $50.",
          enabled: enabled.custom?.tool_create_refund ?? false,
        },
        {
          id: "tool_loyalty_balance",
          name: "Loyalty Points Balance",
          description: "Reads points balance by email.",
          enabled: enabled.custom?.tool_loyalty_balance ?? false,
        },
        {
          id: "tool_warranty_check",
          name: "Warranty Check",
          description: "Validates serial number against warranty DB.",
          enabled: enabled.custom?.tool_warranty_check ?? false,
        },
      ],
    },
  ];
}

function defaultProcedures(enabled: Record<string, boolean>): AgentWorkspace["procedures"] {
  return [
    {
      id: "proc_refund",
      name: "Refund escalation",
      whenToUse: "Customer asks to cancel and refund an order already shipped.",
      status: "live",
      enabled: enabled.refund ?? true,
      stepCount: 6,
      lastSimulatedAt: hoursAgo(20),
    },
    {
      id: "proc_order",
      name: "Order status",
      whenToUse: "Customer provides an order ID and wants tracking or ETA.",
      status: "live",
      enabled: enabled.order ?? true,
      stepCount: 4,
      lastSimulatedAt: daysAgo(2),
    },
    {
      id: "proc_cancel",
      name: "Cancel subscription",
      whenToUse: "Customer wants to cancel a paid plan and keep access until period end.",
      status: "draft",
      enabled: enabled.cancel ?? false,
      stepCount: 5,
      lastSimulatedAt: null,
    },
  ];
}

function improveItems(prefix: string): ImproveItem[] {
  return [
    {
      id: `${prefix}-gap-warranty`,
      kind: "knowledge-gap",
      title: "Extended warranty after 30 days",
      description: "Customers ask about buying coverage after the return window. No article covers this.",
      status: "open",
      occurrences: 14,
      conversationId: `${prefix}-c-warranty`,
      suggestedAction: "Add a Q&A or Help Center article for post-purchase warranty.",
      createdAt: hoursAgo(6),
    },
    {
      id: `${prefix}-gap-giftcard`,
      kind: "knowledge-gap",
      title: "Gift card balance lookup",
      description: "AI could not find how customers check remaining gift card value.",
      status: "open",
      occurrences: 9,
      conversationId: `${prefix}-c-gift`,
      suggestedAction: "Add native Q&A or enable a gift-card lookup action.",
      createdAt: hoursAgo(18),
    },
    {
      id: `${prefix}-conflict-refund`,
      kind: "knowledge-conflict",
      title: "Refund window 14 vs 30 days",
      description: "Refund policy.pdf says 30 days; Help Center article says 14 days for sale items.",
      status: "open",
      occurrences: 7,
      conversationId: `${prefix}-c-refund`,
      suggestedAction: "Resolve the sale-item exception in one source of truth.",
      createdAt: daysAgo(1),
    },
    {
      id: `${prefix}-dup-shipping`,
      kind: "duplicate-content",
      title: "Two shipping SLA articles",
      description: "Native PDF and Zendesk ‘Delivery times’ cover the same lanes with different ETAs.",
      status: "reviewing",
      occurrences: 4,
      conversationId: null,
      suggestedAction: "Keep Help Center as canonical and archive the PDF.",
      createdAt: daysAgo(3),
    },
    {
      id: `${prefix}-action-gift`,
      kind: "missing-action",
      title: "Check gift card balance",
      description: "The agent explained policy but could not call an API to return a live balance.",
      status: "open",
      occurrences: 6,
      conversationId: `${prefix}-c-gift`,
      suggestedAction: "Add a custom HTTP tool for gift card lookup.",
      createdAt: hoursAgo(12),
    },
    {
      id: `${prefix}-proc-rma`,
      kind: "missing-procedure",
      title: "Start an RMA for damaged items",
      description: "Multi-step collect photos → create RMA → book pickup was improvised by the LLM.",
      status: "open",
      occurrences: 5,
      conversationId: `${prefix}-c-rma`,
      suggestedAction: "Author an RMA procedure that calls the returns tool, then hand off if photos are missing.",
      createdAt: daysAgo(2),
    },
  ];
}

function conversations(prefix: string, channel: AgentWorkspace["conversations"][number]["channel"]): AgentWorkspace["conversations"] {
  return [
    {
      id: `${prefix}-c-refund`,
      channel,
      customerName: "Maya Chen",
      customerEmail: "maya@example.com",
      preview: "I need a refund for order #48219 — it arrived damaged.",
      status: "handed_over",
      startedAt: hoursAgo(3),
      messageCount: 6,
      billable: true,
      knowledgeGap: false,
      messages: [
        {
          id: "m1",
          role: "customer",
          content: "I need a refund for order #48219 — it arrived damaged.",
          at: hoursAgo(3),
        },
        {
          id: "m2",
          role: "assistant",
          content:
            "I’m sorry the order arrived damaged. I found #48219 shipped Aug 18. I can start a refund after a photo of the damage. Would you like me to connect you with a specialist?",
          at: hoursAgo(3),
        },
        {
          id: "m3",
          role: "system",
          content: "Handed over to Zendesk Support · tag ai_escalated",
          at: hoursAgo(2.9),
        },
      ],
    },
    {
      id: `${prefix}-c-track`,
      channel,
      customerName: "Jonah Price",
      customerEmail: "jonah@example.com",
      preview: "Where is my package? Order 11902.",
      status: "resolved",
      startedAt: hoursAgo(8),
      messageCount: 4,
      billable: true,
      knowledgeGap: false,
      messages: [
        {
          id: "m1",
          role: "customer",
          content: "Where is my package? Order 11902.",
          at: hoursAgo(8),
        },
        {
          id: "m2",
          role: "assistant",
          content:
            "Order 11902 is with UPS, out for delivery today. Tracking: 1Z999AA10123456784.",
          at: hoursAgo(8),
        },
      ],
    },
    {
      id: `${prefix}-c-warranty`,
      channel: "web_chat",
      customerName: "Priya Shah",
      customerEmail: "priya@example.com",
      preview: "Can I still buy extended warranty? I bought this 45 days ago.",
      status: "ai_active",
      startedAt: hoursAgo(5),
      messageCount: 3,
      billable: true,
      knowledgeGap: true,
      messages: [
        {
          id: "m1",
          role: "customer",
          content: "Can I still buy extended warranty? I bought this 45 days ago.",
          at: hoursAgo(5),
        },
        {
          id: "m2",
          role: "assistant",
          content:
            "I don’t have a documented policy for buying warranty after 30 days. I can connect you with a specialist who can check eligibility.",
          at: hoursAgo(5),
        },
      ],
    },
  ];
}

function createCustomerSupport(): AgentWorkspace {
  return {
    id: "customer-support",
    name: "Customer Support",
    description: "Handles shipping, returns, and general product questions.",
    icon: "support",
    status: "live",
    hasUnpublishedChanges: false,
    updatedAt: hoursAgo(4),
    publishedAt: daysAgo(12),
    settings: {
      systemPrompt: defaultPrompt("the Customer Support agent"),
      escalateOnLowConfidence: true,
      handover: defaultHandover(),
    },
    analytics: {
      kpis: [
        {
          id: "tickets",
          label: "AI-handled conversations",
          displayValue: "412",
          change: 12.4,
          changeLabel: "vs prior 20 days",
          direction: "up",
          sparkline: spark(280, 10),
        },
        {
          id: "resolution",
          label: "AI resolution rate",
          displayValue: "76%",
          change: 5,
          changeLabel: "vs prior 20 days",
          direction: "up",
          sparkline: spark(68, 0.7),
        },
        {
          id: "handoff",
          label: "Human handoff rate",
          displayValue: "24%",
          change: 5,
          changeLabel: "vs prior 20 days",
          direction: "down",
          invert: true,
          sparkline: spark(32, -0.6),
        },
      ],
      ticketsOverTime: ticketsSeries(),
      topTopics: [
        { topic: "Order tracking", conversations: 98, resolutionRate: 91 },
        { topic: "Refunds", conversations: 74, resolutionRate: 62 },
        { topic: "Shipping delays", conversations: 51, resolutionRate: 84 },
        { topic: "Warranty", conversations: 22, resolutionRate: 41 },
      ],
      avgConfidence: 0.82,
      knowledgeGroundedRate: 94,
      remainingCredits: 588,
      includedCredits: 1000,
    },
    knowledge: {
      sources: knowledgeSources({
        nativeEnabled: true,
        zendeskHelpCenter: true,
        zendeskTickets: true,
      }),
    },
    actions: defaultActions({
      zendesk: { zd_internal_note: true },
      calendly: { cal_schedule: true, cal_availability: true },
      custom: { tool_order_lookup: true, tool_create_refund: true },
    }),
    procedures: defaultProcedures({ refund: true, order: true, cancel: false }),
    webChat: {
      enabled: true,
      greeting: "Hi — I can help with orders, shipping, and returns.",
      position: "right",
      primaryColor: "#111111",
      domainAllowlist: ["acme.com", "help.acme.com"],
      publishableKey: "pk_live_acme_support",
    },
    helpDesk: {
      connectorId: "conn_zd_us",
      slug: "zendesk",
      name: "Zendesk — US Support",
      identifier: "support.acme.zendesk.com",
      status: "active",
      useChannel: true,
      routing: "inherit",
    },
    conversations: conversations("cs", "zendesk"),
    improve: improveItems("cs"),
    testCases: [
      {
        id: "tc-track",
        name: "Track a shipped order",
        prompt: "Where is order 11902?",
        expectedContains: "UPS",
        lastResult: "pass",
        lastRunAt: hoursAgo(26),
      },
      {
        id: "tc-refund-policy",
        name: "Refund window",
        prompt: "How many days do I have to request a refund?",
        expectedContains: "30 days",
        lastResult: "fail",
        lastRunAt: hoursAgo(26),
      },
    ],
    testRuns: [
      {
        id: "tr-1",
        name: "Regression · Aug 25",
        startedAt: hoursAgo(26),
        status: "failed",
        passRate: 50,
        caseCount: 2,
      },
    ],
  };
}

function createBillingSupport(): AgentWorkspace {
  return {
    id: "billing-support",
    name: "Billing Support",
    description: "Invoices, subscriptions, refunds, and plan changes.",
    icon: "billing",
    status: "live",
    hasUnpublishedChanges: true,
    updatedAt: hoursAgo(2),
    publishedAt: daysAgo(20),
    settings: {
      systemPrompt: defaultPrompt("the Billing Support agent"),
      escalateOnLowConfidence: true,
      handover: { ...defaultHandover(), team: "Billing", tags: "ai_escalated,billing" },
    },
    analytics: {
      kpis: [
        {
          id: "tickets",
          label: "AI-handled conversations",
          displayValue: "198",
          change: 3.1,
          changeLabel: "vs prior 20 days",
          direction: "up",
          sparkline: spark(150, 4),
        },
        {
          id: "resolution",
          label: "AI resolution rate",
          displayValue: "68%",
          change: 9,
          changeLabel: "vs prior 20 days",
          direction: "down",
          sparkline: spark(74, -0.5),
        },
        {
          id: "handoff",
          label: "Human handoff rate",
          displayValue: "32%",
          change: 9,
          changeLabel: "vs prior 20 days",
          direction: "up",
          invert: true,
          sparkline: spark(24, 0.7),
        },
      ],
      ticketsOverTime: ticketsSeries().map((point, index) => ({
        ...point,
        value: 8 + index + (index % 3),
      })),
      topTopics: [
        { topic: "Invoice copy", conversations: 61, resolutionRate: 88 },
        { topic: "Cancel plan", conversations: 44, resolutionRate: 54 },
        { topic: "Failed payment", conversations: 29, resolutionRate: 71 },
      ],
      avgConfidence: 0.74,
      knowledgeGroundedRate: 89,
      remainingCredits: 588,
      includedCredits: 1000,
    },
    knowledge: {
      sources: knowledgeSources({
        nativeEnabled: true,
        zendeskHelpCenter: true,
        zendeskTickets: false,
      }),
    },
    actions: defaultActions({
      zendesk: { zd_tag_ticket: true, zd_internal_note: true },
      stripe: { stripe_lookup_sub: true, stripe_portal_link: true },
    }),
    procedures: defaultProcedures({ refund: true, order: false, cancel: true }),
    webChat: {
      enabled: false,
      greeting: "I can help with invoices, plans, and payments.",
      position: "right",
      primaryColor: "#111111",
      domainAllowlist: ["acme.com"],
      publishableKey: "pk_live_acme_billing",
    },
    helpDesk: {
      connectorId: "conn_zd_us",
      slug: "zendesk",
      name: "Zendesk — US Support",
      identifier: "support.acme.zendesk.com",
      status: "active",
      useChannel: true,
      routing: "inherit",
    },
    conversations: conversations("bs", "zendesk"),
    improve: improveItems("bs"),
    testCases: [
      {
        id: "tc-invoice",
        name: "Send last invoice",
        prompt: "Can you email me last month’s invoice?",
        expectedContains: "invoice",
        lastResult: "pass",
        lastRunAt: hoursAgo(40),
      },
    ],
    testRuns: [
      {
        id: "tr-billing-1",
        name: "Billing Support Agent — Aug 24",
        startedAt: hoursAgo(40),
        status: "passed",
        passRate: 94,
        caseCount: 8,
      },
    ],
  };
}

function createTechnicalSupport(): AgentWorkspace {
  return {
    id: "technical-support",
    name: "Technical Support",
    description: "Product setup, troubleshooting, and integrations.",
    icon: "technical",
    status: "draft",
    hasUnpublishedChanges: true,
    updatedAt: hoursAgo(1),
    publishedAt: null,
    settings: {
      systemPrompt: defaultPrompt("the Technical Support agent"),
      escalateOnLowConfidence: true,
      handover: defaultHandover(),
    },
    analytics: {
      kpis: [
        {
          id: "tickets",
          label: "AI-handled conversations",
          displayValue: "0",
          change: 0,
          changeLabel: "Not published",
          direction: "neutral",
          sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          id: "resolution",
          label: "AI resolution rate",
          displayValue: "—",
          change: 0,
          changeLabel: "Playground only",
          direction: "neutral",
          sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          id: "handoff",
          label: "Human handoff rate",
          displayValue: "—",
          change: 0,
          changeLabel: "Playground only",
          direction: "neutral",
          invert: true,
          sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ],
      ticketsOverTime: ticketsSeries().map((point) => ({ ...point, value: 0 })),
      topTopics: [],
      avgConfidence: 0,
      knowledgeGroundedRate: 0,
      remainingCredits: 588,
      includedCredits: 1000,
    },
    knowledge: {
      sources: knowledgeSources({
        nativeEnabled: false,
        zendeskHelpCenter: false,
        zendeskTickets: false,
      }),
    },
    actions: defaultActions({ custom: { tool_order_lookup: true } }),
    procedures: defaultProcedures({ refund: false, order: false, cancel: false }),
    webChat: {
      enabled: false,
      greeting: "I can help with setup and troubleshooting.",
      position: "right",
      primaryColor: "#111111",
      domainAllowlist: [],
      publishableKey: "pk_live_acme_technical",
    },
    helpDesk: {
      connectorId: "conn_zd_us",
      slug: "zendesk",
      name: "Zendesk — US Support",
      identifier: "support.acme.zendesk.com",
      status: "active",
      useChannel: false,
      routing: "inherit",
    },
    conversations: [],
    improve: [],
    testCases: [],
    testRuns: [],
  };
}

function seedAgents(): AgentWorkspace[] {
  return [createCustomerSupport(), createBillingSupport(), createTechnicalSupport()];
}

const orgAgents = new Map<string, AgentWorkspace[]>();

function getOrgAgents(orgId: string): AgentWorkspace[] {
  if (!orgAgents.has(orgId)) {
    orgAgents.set(orgId, seedAgents());
  }

  return orgAgents.get(orgId)!;
}

function toListItem(agent: AgentWorkspace): AgentListItem {
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    icon: agent.icon,
    status: agent.status,
    updatedAt: agent.updatedAt,
    publishedAt: agent.publishedAt,
    tickets: Number.parseInt(agent.analytics.kpis[0]?.displayValue ?? "0", 10) || 0,
    resolutionRate:
      Number.parseInt(agent.analytics.kpis[1]?.displayValue ?? "0", 10) || 0,
    handoffRate: Number.parseInt(agent.analytics.kpis[2]?.displayValue ?? "0", 10) || 0,
    knowledgeSourceCount: agent.knowledge.sources.filter(
      (source) => source.enabled && source.state === "connected"
    ).length,
    liveChannelCount:
      Number(agent.webChat.enabled) + Number(agent.helpDesk.useChannel),
    openImproveCount: agent.improve.filter((item) => item.status !== "resolved").length,
  };
}

export function getAgentsList(orgId: string): AgentsList {
  return {
    agents: getOrgAgents(orgId).map(toListItem),
    planAgentLimit: 5,
  };
}

function findAgent(orgId: string, agentId: string) {
  return getOrgAgents(orgId).find((item) => item.id === agentId) ?? null;
}

function findAgentIndex(orgId: string, agentId: string) {
  return getOrgAgents(orgId).findIndex((item) => item.id === agentId);
}

function pickCore(agent: AgentWorkspace) {
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    icon: agent.icon,
    status: agent.status,
    hasUnpublishedChanges: agent.hasUnpublishedChanges,
    updatedAt: agent.updatedAt,
    publishedAt: agent.publishedAt,
  };
}

function touchAgent(agent: AgentWorkspace, published = false) {
  const now = new Date().toISOString();
  agent.updatedAt = now;

  if (published) {
    agent.status = "live";
    agent.publishedAt = now;
    agent.hasUnpublishedChanges = false;
    return;
  }

  agent.hasUnpublishedChanges = true;
}

export function getAgentCore(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);
  return agent ? pickCore(cloneWorkspace(agent)) : null;
}

export function getAgentSettings(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);
  return agent ? cloneWorkspace(agent).settings : null;
}

export function getAgentAnalytics(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);
  return agent ? cloneWorkspace(agent).analytics : null;
}

export function getAgentKnowledge(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);
  return agent ? cloneWorkspace(agent).knowledge : null;
}

export function getAgentActions(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);
  return agent ? { actions: cloneWorkspace(agent).actions } : null;
}

export function getAgentProcedures(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);
  return agent ? { procedures: cloneWorkspace(agent).procedures } : null;
}

export function getAgentWebChat(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);
  return agent ? cloneWorkspace(agent).webChat : null;
}

export function getAgentHelpDesk(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);
  return agent ? cloneWorkspace(agent).helpDesk : null;
}

export function getAgentConversations(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);
  return agent ? { conversations: cloneWorkspace(agent).conversations } : null;
}

export function getAgentImprove(
  orgId: string,
  agentId: string,
  kind?: ImproveItem["kind"]
) {
  const agent = findAgent(orgId, agentId);

  if (!agent) {
    return null;
  }

  const items = kind
    ? agent.improve.filter((item) => item.kind === kind)
    : agent.improve;

  return { items: structuredClone(items) };
}

export function getAgentTestCases(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);
  return agent ? { testCases: cloneWorkspace(agent).testCases } : null;
}

export function getAgentTestRuns(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);
  return agent ? { testRuns: cloneWorkspace(agent).testRuns } : null;
}

export function getAgentPlayground(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);

  if (!agent) {
    return null;
  }

  return {
    name: agent.name,
    remainingCredits: agent.analytics.remainingCredits,
  };
}

/** @deprecated Use section getters instead */
export function getAgentWorkspace(orgId: string, agentId: string): AgentWorkspace | null {
  const agent = findAgent(orgId, agentId);
  return agent ? cloneWorkspace(agent) : null;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export function createAgent(orgId: string, input: CreateAgentInput): AgentCore {
  const agents = getOrgAgents(orgId);
  const base = slugify(input.name) || "agent";
  let id = `agt-${base}`;
  let suffix = 2;

  while (agents.some((agent) => agent.id === id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  const template = createTechnicalSupport();
  const agent: AgentWorkspace = {
    ...template,
    id,
    name: input.name.trim(),
    description: input.description?.trim() || "New AI support agent.",
    icon: "support",
    status: "draft",
    hasUnpublishedChanges: true,
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    settings: {
      ...template.settings,
      systemPrompt: defaultPrompt(input.name.trim()),
    },
    conversations: [],
    improve: [],
    testCases: [],
    testRuns: [],
  };

  agents.unshift(agent);
  return pickCore(cloneWorkspace(agent));
}

export function updateAgentCore(
  orgId: string,
  agentId: string,
  input: {
    name?: string;
    description?: string;
    publish?: boolean;
  }
) {
  const index = findAgentIndex(orgId, agentId);

  if (index === -1) {
    return null;
  }

  const agent = getOrgAgents(orgId)[index];

  if (input.name) {
    agent.name = input.name.trim();
  }

  if (input.description !== undefined) {
    agent.description = input.description.trim();
  }

  if (input.publish) {
    touchAgent(agent, true);
  } else if (input.name !== undefined || input.description !== undefined) {
    touchAgent(agent);
  }

  return pickCore(cloneWorkspace(agent));
}

export function updateAgentSettings(
  orgId: string,
  agentId: string,
  input: UpdateAgentSettingsInput["settings"]
) {
  const index = findAgentIndex(orgId, agentId);

  if (index === -1) {
    return null;
  }

  const agent = getOrgAgents(orgId)[index];

  if (input.systemPrompt !== undefined) {
    agent.settings.systemPrompt = input.systemPrompt;
  }

  if (input.escalateOnLowConfidence !== undefined) {
    agent.settings.escalateOnLowConfidence = input.escalateOnLowConfidence;
  }

  if (input.handover) {
    agent.settings.handover = {
      ...agent.settings.handover,
      ...input.handover,
    };
  }

  touchAgent(agent);
  return cloneWorkspace(agent).settings;
}

export function updateAgentKnowledge(
  orgId: string,
  agentId: string,
  input: {
    knowledgeSourceId?: string;
    knowledgeEnabled?: boolean;
    addUrl?: string;
    addFile?: { name: string };
    addQna?: { title: string; question: string; answer: string };
    knowledgeResourceAction?: {
      sourceId: string;
      resourceIds: string[];
      action: "train" | "untrain" | "remove";
    };
  }
) {
  const index = findAgentIndex(orgId, agentId);

  if (index === -1) {
    return null;
  }

  const agent = getOrgAgents(orgId)[index];
  const now = new Date().toISOString();

  if (input.knowledgeSourceId && input.knowledgeEnabled !== undefined) {
    const source = agent.knowledge.sources.find(
      (item) => item.id === input.knowledgeSourceId
    );

    if (source && source.state === "connected") {
      source.enabled = input.knowledgeEnabled;
    }
  }

  if (input.addUrl) {
    const website = agent.knowledge.sources.find((source) => source.kind === "website");

    if (website) {
      website.enabled = true;
      website.resources.unshift({
        type: "url",
        id: `url_${Date.now()}`,
        url: input.addUrl,
        title: new URL(input.addUrl).hostname,
        status: "crawling",
        pageCount: 0,
        updatedAt: now,
        addedBy: "You",
        trained: false,
      });
    }
  }

  if (input.addFile) {
    const files = agent.knowledge.sources.find((source) => source.kind === "files");

    if (files) {
      files.enabled = true;
      files.resources.unshift({
        type: "file",
        id: `file_${Date.now()}`,
        name: input.addFile.name,
        sizeLabel: "—",
        status: "processing",
        updatedAt: now,
        addedBy: "You",
        trained: false,
      });
    }
  }

  if (input.addQna) {
    const qna = agent.knowledge.sources.find((source) => source.kind === "qna");

    if (qna) {
      qna.enabled = true;
      qna.resources.unshift({
        type: "qna",
        id: `qna_${Date.now()}`,
        question: input.addQna.question,
        answer: input.addQna.answer,
        updatedAt: now,
        addedBy: "You",
        trained: false,
      });
    }
  }

  if (input.knowledgeResourceAction) {
    const source = agent.knowledge.sources.find(
      (item) => item.id === input.knowledgeResourceAction!.sourceId
    );

    if (source) {
      const { resourceIds, action } = input.knowledgeResourceAction;
      const isNative =
        source.kind === "website" ||
        source.kind === "files" ||
        source.kind === "qna";

      if (action === "remove" && isNative) {
        source.resources = source.resources.filter(
          (resource) => !resourceIds.includes(resource.id)
        );
      } else {
        for (const resource of source.resources) {
          if (!resourceIds.includes(resource.id)) {
            continue;
          }

          if (action === "train") {
            resource.trained = true;
            resource.updatedAt = now;

            if (resource.type === "url" || resource.type === "file") {
              resource.status = "indexed";
            }

            if (resource.type === "article") {
              resource.status = "indexed";
            }
          }

          if (action === "untrain") {
            resource.trained = false;
            resource.updatedAt = now;

            if (resource.type === "article") {
              resource.status = "pending";
            }
          }
        }
      }
    }
  }

  touchAgent(agent);
  return cloneWorkspace(agent).knowledge;
}

export function updateAgentActions(
  orgId: string,
  agentId: string,
  input: {
    actionId: string;
    actionSubActionId: string;
    actionSubActionEnabled: boolean;
  }
) {
  const index = findAgentIndex(orgId, agentId);

  if (index === -1) {
    return null;
  }

  const agent = getOrgAgents(orgId)[index];
  const action = agent.actions.find((item) => item.id === input.actionId);

  if (action && action.connected) {
    const subAction = action.subActions.find(
      (item) => item.id === input.actionSubActionId
    );

    if (subAction) {
      subAction.enabled = input.actionSubActionEnabled;
    }
  }

  touchAgent(agent);
  return { actions: cloneWorkspace(agent).actions };
}

export function updateAgentProcedures(
  orgId: string,
  agentId: string,
  input: {
    procedureId: string;
    procedureEnabled: boolean;
  }
) {
  const index = findAgentIndex(orgId, agentId);

  if (index === -1) {
    return null;
  }

  const agent = getOrgAgents(orgId)[index];
  const procedure = agent.procedures.find((item) => item.id === input.procedureId);

  if (procedure) {
    procedure.enabled = input.procedureEnabled;
  }

  touchAgent(agent);
  return { procedures: cloneWorkspace(agent).procedures };
}

export function updateAgentWebChat(
  orgId: string,
  agentId: string,
  input: Partial<AgentWorkspace["webChat"]>
) {
  const index = findAgentIndex(orgId, agentId);

  if (index === -1) {
    return null;
  }

  const agent = getOrgAgents(orgId)[index];
  agent.webChat = { ...agent.webChat, ...input };
  touchAgent(agent);
  return cloneWorkspace(agent).webChat;
}

export function updateAgentHelpDesk(
  orgId: string,
  agentId: string,
  input: { useChannel: boolean }
) {
  const index = findAgentIndex(orgId, agentId);

  if (index === -1) {
    return null;
  }

  const agent = getOrgAgents(orgId)[index];
  agent.helpDesk.useChannel = input.useChannel;
  touchAgent(agent);
  return cloneWorkspace(agent).helpDesk;
}
