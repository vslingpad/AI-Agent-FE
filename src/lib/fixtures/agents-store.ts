import type {
  AgentListItem,
  AgentCore,
  AgentWorkspace,
  AgentsList,
  ConversationQuery,
  CreateAgentInput,
  ImproveItem,
  KnowledgeSource,
  UpdateAgentSettingsInput,
} from "@/lib/schemas/agents";
import { CONVERSATION_LOCATION_NONE } from "@/lib/conversations/conversation-utils";
import { buildDeployChannels, countEnabledDeployChannels } from "@/lib/deploy/deploy-channels";
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

function defaultAgentSettings(systemPrompt: string): AgentWorkspace["settings"] {
  return {
    systemPrompt,
    handoverConnectorId: "conn_zd_us",
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
      title: "Refund timing",
      question: "How long do refunds take?",
      questions: ["How long do refunds take?"],
      answer: "Refunds are issued within 5–7 business days after approval.",
      updatedAt: daysAgo(2),
      addedBy: "Sam Patel",
      trained: true,
    },
    {
      type: "qna",
      id: "qna_2",
      title: "International shipping",
      question: "Do you ship internationally?",
      questions: ["Do you ship internationally?"],
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

function refundConversation(
  prefix: string
): AgentWorkspace["conversations"][number] {
  const hours = 3;
  const startedAt = hoursAgo(hours);
  const thread: Array<{
    role: "customer" | "assistant";
    content: string;
  }> = [
    {
      role: "customer",
      content:
        "Hi — I need a **refund for order `#48219`**. The package arrived yesterday and the **ceramic vase inside was shattered**. I already took photos.",
    },
    {
      role: "assistant",
      content:
        "I'm sorry your order arrived damaged, Maya. I pulled up **order `#48219`** shipped on **Aug 18** via UPS.\n\nTo start a refund I need:\n\n1. A clear photo of the **outer box** showing damage\n2. A photo of the **broken item**\n3. Confirmation you want a **full refund** (not a replacement)\n\nYou can upload files here or email **returns@acme.com** with the subject `REFUND-48219`.",
    },
    {
      role: "customer",
      content:
        "Photos attached. The box was **crushed on one corner** — looks like it was dropped. I want a **full refund** to my original card, not store credit.\n\nAlso, I paid **$14.99 for expedited shipping**. Should that be refunded too?",
    },
    {
      role: "assistant",
      content:
        "Thanks — I can see both images.\n\nFor **damaged-in-transit** claims our policy covers:\n\n- **Item price** — `$89.00` for the vase\n- **Expedited shipping** — `$14.99` when the item cannot be used\n- **Tax** — `$8.01` pro-rated on the refunded amount\n\n**Estimated total refund: `$112.00`** to the Visa ending in `4242`.\n\nRefunds typically post in **3–5 business days** after approval.",
    },
    {
      role: "customer",
      content:
        "That works. One more thing — I bought this as a **gift** and already gave the recipient the tracking link from https://track.acme.com/t/48219. Will they get any email about the refund?",
    },
    {
      role: "assistant",
      content:
        "Good question. **Refund notifications** go only to the **account email** on file — `maya@example.com`. The gift recipient will **not** receive billing emails.\n\nIf you want, I can add an internal note that the item was returned/refunded so support doesn't ask them to rate delivery.",
    },
    {
      role: "customer",
      content:
        "Yes please add that note. Also, do I need to **ship the broken vase back**? It's in pieces and not really packable.",
    },
    {
      role: "assistant",
      content:
        "For **shattered fragile items** we usually **do not require a return shipment** when photos clearly show the damage.\n\nI've flagged this case as **keep item / dispose locally** so you don't need to print a return label.\n\n```\nReturn required: NO\nReason: Damaged beyond use — photos verified\n```",
    },
    {
      role: "customer",
      content:
        "Perfect. How long until the refund is **approved**? I need it before my card statement closes on the **30th**.",
    },
    {
      role: "assistant",
      content:
        "I've submitted the refund for **auto-approval** since photos meet our damage threshold.\n\n- **Approval:** usually within **2 hours** during business hours\n- **Bank posting:** **3–5 business days** after approval\n- **Statement date Aug 30:** you should see it if approved today\n\nI'll watch the case and reply here if finance needs anything else.",
    },
    {
      role: "customer",
      content:
        "Got it. Can you confirm the **case number** in case I need to call back? Last time support couldn't find my ticket.",
    },
    {
      role: "assistant",
      content:
        "Absolutely. Your case details:\n\n- **Case ID:** `ZD-88421-REF`\n- **Order:** `#48219`\n- **Type:** Damaged delivery — full refund\n- **Status:** *Pending auto-approval*\n\nQuote **`ZD-88421-REF`** to any agent and they'll see this entire thread.",
    },
    {
      role: "customer",
      content:
        "Thanks. If approval fails for some reason, will someone **email me** or do I have to check back here?",
    },
    {
      role: "assistant",
      content:
        "You'll get an email at **`maya@example.com`** either way:\n\n- **Approved** → subject: *Your refund for order 48219 is on the way*\n- **Needs info** → subject: *Action needed on your refund request*\n\nYou can also reply in this chat — I'll reopen the case automatically.",
    },
    {
      role: "customer",
      content:
        "One last question: will this refund affect my **Acme Rewards points** from that purchase? I earned about **890 points**.",
    },
    {
      role: "assistant",
      content:
        "Yes — when a order is **fully refunded**, points earned on that order are **clawed back** proportionally.\n\nFor `#48219` you'd lose **890 points** (~**$8.90** in store credit value). Points already redeemed won't go negative; your balance stops at **0**.\n\nI can send a **rewards ledger export** if you want the exact line item.",
    },
    {
      role: "customer",
      content:
        "No that's fine, just wanted to know. Please proceed with the **$112 refund** as discussed.",
    },
    {
      role: "assistant",
      content:
        "Done — I've locked in the refund request:\n\n**Refund breakdown**\n1. Vase — `$89.00`\n2. Expedited shipping — `$14.99`\n3. Tax — `$8.01`\n\n**Total refund: `$112.00`**\n\nApproval is queued. You'll get a confirmation email once finance releases it.",
    },
    {
      role: "customer",
      content:
        "Thanks — just confirm the total is **$112** to my Visa ending in **4242** before I sign off.",
    },
    {
      role: "assistant",
      content:
        "Yes — **$112.00 total** is correct. Sorry for the formatting; here's the plain summary:\n\n**Refund breakdown**\n- Product: `$89.00`\n- Shipping: `$14.99`\n- Tax: `$8.01`\n\n**Total refund: `$112.00`** to Visa `•••• 4242`.\n\nA specialist will take over only if auto-approval rejects the claim — otherwise you're all set.",
    },
  ];

  const messages: AgentWorkspace["conversations"][number]["messages"] = thread.map(
    (entry, index) => ({
      id: `${prefix}-c-refund-m${index + 1}`,
      role: entry.role,
      content: entry.content,
      at: new Date(
        new Date(startedAt).getTime() + index * 2 * 60 * 1000
      ).toISOString(),
    })
  );

  return {
    id: `${prefix}-c-refund`,
    channel: "zendesk",
    customerName: "Maya Chen",
    customerEmail: "maya@example.com",
    location: "San Francisco, US",
    preview: thread[0]?.content.slice(0, 120) ?? "",
    status: "handed_over",
    startedAt,
    messageCount: messages.length,
    billable: true,
    knowledgeGap: false,
    messages,
  };
}

function conversations(prefix: string): AgentWorkspace["conversations"] {
  const templates: Array<{
    id: string;
    channel: AgentWorkspace["conversations"][number]["channel"];
    customerName: string | null;
    customerEmail: string | null;
    location: string | null;
    customerMsg: string;
    assistantMsg: string;
    status: AgentWorkspace["conversations"][number]["status"];
    hours: number;
    billable: boolean;
    knowledgeGap: boolean;
    systemMsg?: string;
  }> = [
    {
      id: `${prefix}-c-refund`,
      channel: "zendesk",
      customerName: "Maya Chen",
      customerEmail: "maya@example.com",
      location: "San Francisco, US",
      customerMsg: "",
      assistantMsg: "",
      status: "handed_over",
      hours: 3,
      billable: true,
      knowledgeGap: false,
    },
    {
      id: `${prefix}-c-track`,
      channel: "zendesk",
      customerName: "Jonah Price",
      customerEmail: "jonah@example.com",
      location: "London, UK",
      customerMsg: "Where is my package? Order 11902.",
      assistantMsg:
        "Order 11902 is with UPS, out for delivery today. Tracking: 1Z999AA10123456784.",
      status: "resolved",
      hours: 8,
      billable: true,
      knowledgeGap: false,
    },
    {
      id: `${prefix}-c-warranty`,
      channel: "web_chat",
      customerName: "Priya Shah",
      customerEmail: "priya@example.com",
      location: null,
      customerMsg: "Can I still buy extended warranty? I bought this 45 days ago.",
      assistantMsg:
        "I don't have a documented policy for buying warranty after 30 days. I can connect you with a specialist who can check eligibility.",
      status: "ai_active",
      hours: 5,
      billable: true,
      knowledgeGap: true,
    },
    {
      id: `${prefix}-c-cancel`,
      channel: "web_chat",
      customerName: "Alex Rivera",
      customerEmail: "alex@example.com",
      location: "New York, US",
      customerMsg: "How do I cancel my subscription before renewal?",
      assistantMsg:
        "You can cancel from Settings → Billing → Manage plan. Renewal stops immediately and access continues until the period ends.",
      status: "resolved",
      hours: 12,
      billable: true,
      knowledgeGap: false,
    },
    {
      id: `${prefix}-c-invoice`,
      channel: "zendesk",
      customerName: "Sam Ortiz",
      customerEmail: "sam@example.com",
      location: "Toronto, CA",
      customerMsg: "Can you send me a copy of invoice INV-8821?",
      assistantMsg:
        "Invoice INV-8821 for $129.00 was emailed to sam@example.com on Aug 12. I can resend it now if you'd like.",
      status: "resolved",
      hours: 16,
      billable: false,
      knowledgeGap: false,
    },
    {
      id: `${prefix}-c-password`,
      channel: "web_chat",
      customerName: "Jordan Lee",
      customerEmail: "jordan@example.com",
      location: null,
      customerMsg: "I forgot my password and the reset link expired.",
      assistantMsg:
        "I can send a fresh reset link to jordan@example.com. It expires in 30 minutes.",
      status: "ai_active",
      hours: 20,
      billable: false,
      knowledgeGap: false,
    },
    {
      id: `${prefix}-c-shipping`,
      channel: "zendesk",
      customerName: "Taylor Brooks",
      customerEmail: "taylor@example.com",
      location: "Chicago, US",
      customerMsg: "My order says delivered but I never received it.",
      assistantMsg:
        "I'm checking carrier proof-of-delivery for order #77304. If the package was left at the wrong address, we can open a replacement claim.",
      status: "handed_over",
      hours: 24,
      billable: true,
      knowledgeGap: false,
      systemMsg: "Handed over to Zendesk Support · missing delivery investigation",
    },
    {
      id: `${prefix}-c-giftcard`,
      channel: "web_chat",
      customerName: "Casey Nguyen",
      customerEmail: "casey@example.com",
      location: "Berlin, DE",
      customerMsg: "Do gift cards expire?",
      assistantMsg:
        "I couldn't find a clear gift card expiry policy in our help center.",
      status: "ai_active",
      hours: 30,
      billable: true,
      knowledgeGap: true,
    },
    {
      id: `${prefix}-c-playground-1`,
      channel: "playground",
      customerName: "Test User",
      customerEmail: "test@example.com",
      location: null,
      customerMsg: "What is your return window?",
      assistantMsg: "Returns are accepted within 30 days of delivery for most items.",
      status: "resolved",
      hours: 36,
      billable: false,
      knowledgeGap: false,
    },
    {
      id: `${prefix}-c-playground-2`,
      channel: "playground",
      customerName: null,
      customerEmail: null,
      location: null,
      customerMsg: "Can I change my shipping address after checkout?",
      assistantMsg:
        "Address changes are allowed until the order enters fulfillment, usually within 2 hours.",
      status: "resolved",
      hours: 40,
      billable: false,
      knowledgeGap: false,
    },
    {
      id: `${prefix}-c-tax`,
      channel: "zendesk",
      customerName: "Riley Morgan",
      customerEmail: "riley@example.com",
      location: "Paris, FR",
      customerMsg: "Why was tax charged on my international order?",
      assistantMsg:
        "Import duties and VAT may apply depending on destination. Your receipt shows a $14.20 tax line for EU VAT.",
      status: "resolved",
      hours: 48,
      billable: true,
      knowledgeGap: false,
    },
    {
      id: `${prefix}-c-loyalty`,
      channel: "web_chat",
      customerName: "Drew Patel",
      customerEmail: "drew@example.com",
      location: "Austin, US",
      customerMsg: "How many points do I have in the rewards program?",
      assistantMsg:
        "You currently have 1,240 points. That's enough for a $12 store credit.",
      status: "resolved",
      hours: 52,
      billable: true,
      knowledgeGap: false,
    },
    {
      id: `${prefix}-c-bulk`,
      channel: "zendesk",
      customerName: "Morgan Ellis",
      customerEmail: "morgan@example.com",
      location: null,
      customerMsg: "Do you offer bulk pricing for 500+ units?",
      assistantMsg:
        "I don't have published bulk pricing tiers. I'll connect you with sales for a custom quote.",
      status: "handed_over",
      hours: 60,
      billable: true,
      knowledgeGap: true,
      systemMsg: "Handed over to Sales · bulk pricing inquiry",
    },
    {
      id: `${prefix}-c-localization`,
      channel: "web_chat",
      customerName: "Avery Kim",
      customerEmail: "avery@example.com",
      location: null,
      customerMsg: "Is support available in French?",
      assistantMsg: "Yes, live chat and email support are available in French 9am–6pm CET.",
      status: "resolved",
      hours: 72,
      billable: false,
      knowledgeGap: false,
    },
    {
      id: `${prefix}-c-api`,
      channel: "playground",
      customerName: "Dev Sandbox",
      customerEmail: "dev@example.com",
      location: null,
      customerMsg: "Where do I find my API key?",
      assistantMsg:
        "API keys live under Settings → Developers. You'll need admin access to create one.",
      status: "resolved",
      hours: 80,
      billable: false,
      knowledgeGap: false,
    },
    {
      id: `${prefix}-c-escalation`,
      channel: "zendesk",
      customerName: "Quinn Adams",
      customerEmail: "quinn@example.com",
      location: "Seattle, US",
      customerMsg: "I've been charged twice for the same order.",
      assistantMsg:
        "I see duplicate charges for order #90112. I'm escalating this to billing to reverse the extra charge.",
      status: "handed_over",
      hours: 96,
      billable: true,
      knowledgeGap: false,
      systemMsg: "Handed over to Billing · duplicate charge review",
    },
    {
      id: `${prefix}-c-stock`,
      channel: "web_chat",
      customerName: "Jamie Fox",
      customerEmail: "jamie@example.com",
      location: "Denver, US",
      customerMsg: "When will the blue XL hoodie be back in stock?",
      assistantMsg:
        "The blue XL hoodie is expected to restock on Sep 15. I can notify you when it's available.",
      status: "ai_active",
      hours: 100,
      billable: true,
      knowledgeGap: false,
    },
    {
      id: `${prefix}-c-privacy`,
      channel: "zendesk",
      customerName: "Robin Hayes",
      customerEmail: "robin@example.com",
      location: null,
      customerMsg: "How do I request deletion of my personal data?",
      assistantMsg:
        "Submit a privacy request at privacy@example.com with the email on your account. We respond within 30 days.",
      status: "resolved",
      hours: 120,
      billable: false,
      knowledgeGap: false,
    },
  ];

  return templates.map((template) => {
    if (template.id === `${prefix}-c-refund`) {
      return refundConversation(prefix);
    }

    const startedAt = hoursAgo(template.hours);
    const messages: AgentWorkspace["conversations"][number]["messages"] = [
      {
        id: `${template.id}-m1`,
        role: "customer",
        content: template.customerMsg,
        at: startedAt,
      },
      {
        id: `${template.id}-m2`,
        role: "assistant",
        content: template.assistantMsg,
        at: startedAt,
      },
    ];

    if (template.systemMsg) {
      messages.push({
        id: `${template.id}-m3`,
        role: "system",
        content: template.systemMsg,
        at: hoursAgo(template.hours - 0.1),
      });
    }

    return {
      id: template.id,
      channel: template.channel,
      customerName: template.customerName,
      customerEmail: template.customerEmail,
      location: template.location,
      preview: template.customerMsg,
      status: template.status,
      startedAt,
      messageCount: messages.length,
      billable: template.billable,
      knowledgeGap: template.knowledgeGap,
      messages,
    };
  });
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
    settings: defaultAgentSettings(defaultPrompt("the Customer Support agent")),
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
    deployChannels: {},
    conversations: conversations("cs"),
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
    settings: defaultAgentSettings(defaultPrompt("the Billing Support agent")),
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
    deployChannels: {},
    conversations: conversations("bs"),
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
    settings: defaultAgentSettings(defaultPrompt("the Technical Support agent")),
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
    deployChannels: {},
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
    liveChannelCount: countEnabledDeployChannels(agent),
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

export function getAgentDeployChannels(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);

  if (!agent) {
    return null;
  }

  return { channels: buildDeployChannels(orgId, cloneWorkspace(agent)) };
}

export function updateAgentDeployChannel(
  orgId: string,
  agentId: string,
  input: { channelId: string; enabled: boolean }
) {
  const index = findAgentIndex(orgId, agentId);

  if (index === -1) {
    return null;
  }

  const agent = getOrgAgents(orgId)[index];

  if (input.channelId === "zendesk") {
    agent.helpDesk.useChannel = input.enabled;
  } else {
    agent.deployChannels = {
      ...(agent.deployChannels ?? {}),
      [input.channelId]: input.enabled,
    };
  }

  touchAgent(agent);
  return { channels: buildDeployChannels(orgId, cloneWorkspace(agent)) };
}

export function getAgentConversations(orgId: string, agentId: string) {
  return queryAgentConversations(orgId, agentId, {
    page: 1,
    pageSize: 100,
  });
}

function matchesConversation(
  conversation: AgentWorkspace["conversations"][number],
  params: ConversationQuery
) {
  if (params.channel && conversation.channel !== params.channel) {
    return false;
  }

  if (params.status && conversation.status !== params.status) {
    return false;
  }

  if (params.billable !== undefined && conversation.billable !== params.billable) {
    return false;
  }

  if (
    params.knowledgeGap !== undefined &&
    conversation.knowledgeGap !== params.knowledgeGap
  ) {
    return false;
  }

  if (params.customer?.trim() || params.conversationId?.trim()) {
    const customerQuery = params.customer?.trim().toLowerCase();
    const conversationIdQuery = params.conversationId?.trim().toLowerCase();

    const customerMatch = customerQuery
      ? (conversation.customerName ?? "").toLowerCase().includes(customerQuery) ||
        (conversation.customerEmail ?? "").toLowerCase().includes(customerQuery)
      : false;

    const conversationIdMatch = conversationIdQuery
      ? conversation.id.toLowerCase().includes(conversationIdQuery)
      : false;

    if (customerQuery && conversationIdQuery) {
      if (!customerMatch && !conversationIdMatch) {
        return false;
      }
    } else if (customerQuery && !customerMatch) {
      return false;
    } else if (conversationIdQuery && !conversationIdMatch) {
      return false;
    }
  }

  if (params.dateFrom) {
    const from = new Date(`${params.dateFrom}T00:00:00`);

    if (new Date(conversation.startedAt) < from) {
      return false;
    }
  }

  if (params.dateTo) {
    const to = new Date(`${params.dateTo}T23:59:59.999`);

    if (new Date(conversation.startedAt) > to) {
      return false;
    }
  }

  if (params.location) {
    if (params.location === CONVERSATION_LOCATION_NONE) {
      if (conversation.location?.trim()) {
        return false;
      }
    } else if (
      (conversation.location ?? "").toLowerCase() !== params.location.toLowerCase()
    ) {
      return false;
    }
  }

  return true;
}

function filterConversations(
  conversations: AgentWorkspace["conversations"],
  params: ConversationQuery
) {
  return conversations
    .filter((conversation) => matchesConversation(conversation, params))
    .sort(
      (left, right) =>
        new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()
    );
}

export function queryAgentConversations(
  orgId: string,
  agentId: string,
  params: ConversationQuery
) {
  const agent = findAgent(orgId, agentId);

  if (!agent) {
    return null;
  }

  const filtered = filterConversations(cloneWorkspace(agent).conversations, params);
  const pageSize = params.pageSize ?? 20;
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(params.page ?? 1, totalPages);
  const pageStart = (page - 1) * pageSize;

  return {
    conversations: filtered.slice(pageStart, pageStart + pageSize),
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

export function getAgentConversationLocations(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);

  if (!agent) {
    return null;
  }

  const conversations = cloneWorkspace(agent).conversations;
  const locationValues = new Set<string>();
  let hasMissingLocation = false;

  for (const conversation of conversations) {
    const location = conversation.location?.trim();

    if (location) {
      locationValues.add(location);
    } else {
      hasMissingLocation = true;
    }
  }

  const locations = [...locationValues]
    .sort((left, right) => left.localeCompare(right))
    .map((location) => ({
      value: location,
      label: location,
    }));

  if (hasMissingLocation) {
    locations.push({
      value: CONVERSATION_LOCATION_NONE,
      label: "No location",
    });
  }

  return { locations };
}

export function exportAgentConversations(
  orgId: string,
  agentId: string,
  params: Omit<ConversationQuery, "page" | "pageSize">
) {
  const agent = findAgent(orgId, agentId);

  if (!agent) {
    return null;
  }

  return {
    conversations: filterConversations(cloneWorkspace(agent).conversations, {
      ...params,
      page: 1,
      pageSize: 100,
    }),
  };
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

type StoredPlaygroundSession = {
  id: string;
  agentId: string;
  orgId: string;
  sessionNumber: number;
  createdAt: string;
  promptOverride: string | null;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    at: string;
  }>;
};

const playgroundSessions = new Map<string, StoredPlaygroundSession[]>();
const playgroundSessionCounters = new Map<string, number>();

function playgroundSessionsKey(orgId: string, agentId: string) {
  return `${orgId}:${agentId}`;
}

function toPlaygroundSession(agent: AgentWorkspace, session: StoredPlaygroundSession) {
  const effectivePrompt = session.promptOverride ?? agent.settings.systemPrompt;

  return {
    id: session.id,
    agentId: agent.id,
    agentName: agent.name,
    sessionNumber: session.sessionNumber,
    createdAt: session.createdAt,
    productionPrompt: agent.settings.systemPrompt,
    promptOverride: session.promptOverride,
    effectivePrompt,
    messages: session.messages,
  };
}

function mockPlaygroundReply(prompt: string, agentName: string) {
  const lower = prompt.toLowerCase();

  if (lower.includes("order") || lower.includes("track")) {
    return "Order 11902 is with UPS and out for delivery today. Tracking number 1Z999AA10123456784.";
  }

  if (lower.includes("refund")) {
    return "Refunds are issued within 5–7 business days after approval. Sale items follow a 14-day window. I can start a refund if you share the order ID.";
  }

  return `${agentName} here. I can help with that from the knowledge base. Could you share a bit more detail, or an order ID if this is about a purchase?`;
}

export function createPlaygroundSession(orgId: string, agentId: string) {
  const agent = findAgent(orgId, agentId);

  if (!agent) {
    return null;
  }

  const key = playgroundSessionsKey(orgId, agentId);
  const sessionNumber = (playgroundSessionCounters.get(key) ?? 0) + 1;
  playgroundSessionCounters.set(key, sessionNumber);

  const session: StoredPlaygroundSession = {
    id: `pg-${agentId}-${sessionNumber}-${Date.now()}`,
    agentId,
    orgId,
    sessionNumber,
    createdAt: new Date().toISOString(),
    promptOverride: null,
    messages: [],
  };

  const sessions = playgroundSessions.get(key) ?? [];
  sessions.unshift(session);
  playgroundSessions.set(key, sessions);

  return toPlaygroundSession(agent, session);
}

export function getPlaygroundSession(
  orgId: string,
  agentId: string,
  sessionId: string
) {
  const agent = findAgent(orgId, agentId);

  if (!agent) {
    return null;
  }

  const sessions = playgroundSessions.get(playgroundSessionsKey(orgId, agentId)) ?? [];
  const session = sessions.find((item) => item.id === sessionId);

  if (!session) {
    return null;
  }

  return toPlaygroundSession(agent, session);
}

export function updatePlaygroundSession(
  orgId: string,
  agentId: string,
  sessionId: string,
  input: { promptOverride: string | null }
) {
  const agent = findAgent(orgId, agentId);

  if (!agent) {
    return null;
  }

  const sessions = playgroundSessions.get(playgroundSessionsKey(orgId, agentId)) ?? [];
  const session = sessions.find((item) => item.id === sessionId);

  if (!session) {
    return null;
  }

  session.promptOverride = input.promptOverride;
  return toPlaygroundSession(agent, session);
}

export function sendPlaygroundMessage(
  orgId: string,
  agentId: string,
  sessionId: string,
  content: string
) {
  const agent = findAgent(orgId, agentId);

  if (!agent) {
    return null;
  }

  const sessions = playgroundSessions.get(playgroundSessionsKey(orgId, agentId)) ?? [];
  const session = sessions.find((item) => item.id === sessionId);

  if (!session) {
    return null;
  }

  const now = new Date().toISOString();

  session.messages.push({
    id: `u-${Date.now()}`,
    role: "user",
    content: content.trim(),
    at: now,
  });

  const replyContent = mockPlaygroundReply(content, agent.name);

  session.messages.push({
    id: `a-${Date.now() + 1}`,
    role: "assistant",
    content: replyContent,
    at: new Date().toISOString(),
  });

  return { session: toPlaygroundSession(agent, session) } as const;
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

  if (input.handoverConnectorId !== undefined) {
    agent.settings.handoverConnectorId = input.handoverConnectorId;
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
    addQna?: { title: string; questions: string[]; answer: string };
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
        title: input.addQna.title,
        question: input.addQna.questions[0],
        questions: input.addQna.questions,
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

export function deleteAgent(orgId: string, agentId: string) {
  const index = findAgentIndex(orgId, agentId);

  if (index === -1) {
    return false;
  }

  getOrgAgents(orgId).splice(index, 1);
  return true;
}
