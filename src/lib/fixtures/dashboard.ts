import { paginateItems } from "@/lib/dashboard/pagination";
import {
  DashboardActivityResponseSchema,
  DashboardAiQualityConversationsResponseSchema,
  DashboardAiQualityResponseSchema,
  DashboardCountriesResponseSchema,
  DashboardDataSchema,
  type ChartPeriod,
  type CountrySortBy,
  type CountryTicketRow,
  type DashboardActivityQuery,
  type DashboardAiQualityConversationsQuery,
  type DashboardCountriesQuery,
  type DashboardData,
  type LowConfidenceConversation,
  type RecentActivityItem,
  type SortDirection,
} from "@/lib/schemas/dashboard";

export const DASHBOARD_COUNTRY_PREVIEW_LIMIT = 5;
export const DASHBOARD_ACTIVITY_PREVIEW_LIMIT = 4;

const sparklineUp = [520, 545, 560, 590, 610, 635, 660, 680, 700, 720, 735, 742];
const sparklineResolution = [62, 64, 65, 66, 67, 68, 69, 70, 70.5, 71, 71.2, 71.4];
const sparklineHandoff = [38, 36, 35, 34, 33, 32, 31, 30.5, 29.8, 29.2, 28.8, 28.6];

const COUNTRY_TICKETS: CountryTicketRow[] = [
  { country: "United States", tickets: 312, changePercent: 15.3, direction: "up" },
  { country: "United Kingdom", tickets: 156, changePercent: 8.7, direction: "up" },
  { country: "Canada", tickets: 98, changePercent: 11.2, direction: "up" },
  { country: "Australia", tickets: 76, changePercent: 2.1, direction: "down" },
  { country: "Germany", tickets: 54, changePercent: 6.4, direction: "up" },
  { country: "France", tickets: 47, changePercent: 4.8, direction: "up" },
  { country: "India", tickets: 41, changePercent: 18.6, direction: "up" },
  { country: "Japan", tickets: 36, changePercent: 1.4, direction: "down" },
  { country: "Brazil", tickets: 29, changePercent: 9.1, direction: "up" },
  { country: "Netherlands", tickets: 24, changePercent: 3.2, direction: "up" },
  { country: "Spain", tickets: 21, changePercent: 5.5, direction: "up" },
  { country: "Italy", tickets: 19, changePercent: 0.8, direction: "down" },
  { country: "Singapore", tickets: 17, changePercent: 12.4, direction: "up" },
  { country: "Mexico", tickets: 15, changePercent: 7.9, direction: "up" },
  { country: "Sweden", tickets: 13, changePercent: 2.6, direction: "up" },
  { country: "Ireland", tickets: 11, changePercent: 6.1, direction: "up" },
  { country: "South Korea", tickets: 9, changePercent: 1.9, direction: "down" },
  { country: "New Zealand", tickets: 7, changePercent: 4.3, direction: "up" },
];

const ACTIVITY_ITEMS: RecentActivityItem[] = [
  {
    id: "activity-1",
    title: "Customer Support Agent published new Procedure",
    description: "Refund escalation workflow updated",
    timestamp: "Today, 10:32 AM",
    icon: "document",
  },
  {
    id: "activity-2",
    title: "12 new Knowledge Gap suggestions detected",
    description: "Review suggested topics to improve coverage",
    timestamp: "Today, 9:15 AM",
    icon: "lightbulb",
  },
  {
    id: "activity-3",
    title: "Zendesk integration reconnected",
    description: "Sync resumed after brief interruption",
    timestamp: "Yesterday, 4:45 PM",
    icon: "link",
  },
  {
    id: "activity-4",
    title: "Test Run completed",
    description: "Billing Support Agent — 94% pass rate",
    timestamp: "Yesterday, 2:20 PM",
    icon: "clipboard",
  },
  {
    id: "activity-5",
    title: "Technical Support Agent published new Procedure",
    description: "Password reset verification steps updated",
    timestamp: "Yesterday, 11:08 AM",
    icon: "document",
  },
  {
    id: "activity-6",
    title: "Stripe integration connected",
    description: "Refund lookup action is now available",
    timestamp: "Sep 6, 3:41 PM",
    icon: "link",
  },
  {
    id: "activity-7",
    title: "4 knowledge conflict suggestions detected",
    description: "Shipping SLA articles need review",
    timestamp: "Sep 6, 1:12 PM",
    icon: "lightbulb",
  },
  {
    id: "activity-8",
    title: "Test Run completed",
    description: "Customer Support Agent — 88% pass rate",
    timestamp: "Sep 6, 10:05 AM",
    icon: "clipboard",
  },
  {
    id: "activity-9",
    title: "Billing Support Agent published new Procedure",
    description: "Invoice dispute handoff path added",
    timestamp: "Sep 5, 5:22 PM",
    icon: "document",
  },
  {
    id: "activity-10",
    title: "Freshdesk integration requires reauth",
    description: "Help desk sync paused until credentials are updated",
    timestamp: "Sep 5, 2:47 PM",
    icon: "link",
  },
  {
    id: "activity-11",
    title: "8 new Knowledge Gap suggestions detected",
    description: "Warranty and return window questions",
    timestamp: "Sep 5, 9:30 AM",
    icon: "lightbulb",
  },
  {
    id: "activity-12",
    title: "Test Run completed",
    description: "Technical Support Agent — 91% pass rate",
    timestamp: "Sep 4, 4:18 PM",
    icon: "clipboard",
  },
  {
    id: "activity-13",
    title: "Customer Support Agent published new Procedure",
    description: "Order tracking status mapping updated",
    timestamp: "Sep 4, 11:55 AM",
    icon: "document",
  },
  {
    id: "activity-14",
    title: "Calendly integration connected",
    description: "Callback scheduling action enabled",
    timestamp: "Sep 3, 3:09 PM",
    icon: "link",
  },
  {
    id: "activity-15",
    title: "3 duplicate content suggestions detected",
    description: "Pricing FAQ articles overlap",
    timestamp: "Sep 3, 10:41 AM",
    icon: "lightbulb",
  },
  {
    id: "activity-16",
    title: "Test Run completed",
    description: "Billing Support Agent — 86% pass rate",
    timestamp: "Sep 2, 6:14 PM",
    icon: "clipboard",
  },
  {
    id: "activity-17",
    title: "Technical Support Agent published new Procedure",
    description: "Device pairing troubleshooting flow added",
    timestamp: "Sep 2, 1:28 PM",
    icon: "document",
  },
  {
    id: "activity-18",
    title: "Zendesk integration synced",
    description: "214 conversations imported",
    timestamp: "Sep 1, 8:02 AM",
    icon: "link",
  },
  {
    id: "activity-19",
    title: "6 new Knowledge Gap suggestions detected",
    description: "International shipping restrictions",
    timestamp: "Aug 31, 4:36 PM",
    icon: "lightbulb",
  },
  {
    id: "activity-20",
    title: "Test Run completed",
    description: "Customer Support Agent — 97% pass rate",
    timestamp: "Aug 31, 12:11 PM",
    icon: "clipboard",
  },
];

const QUALITY_BY_PERIOD: Record<
  ChartPeriod,
  {
    avgConfidence: number;
    confidenceDistribution: { high: number; medium: number; low: number };
    lowConfidenceRate: number;
    lowConfidenceChange: number;
    knowledgeGroundedRate: number;
    knowledgeGroundedChange: number;
  }
> = {
  "7d": {
    avgConfidence: 92.4,
    confidenceDistribution: { high: 88, medium: 9, low: 3 },
    lowConfidenceRate: 3.6,
    lowConfidenceChange: 0.4,
    knowledgeGroundedRate: 95.2,
    knowledgeGroundedChange: 1.4,
  },
  "30d": {
    avgConfidence: 91.2,
    confidenceDistribution: { high: 86, medium: 10, low: 4 },
    lowConfidenceRate: 4.2,
    lowConfidenceChange: 0.6,
    knowledgeGroundedRate: 94.1,
    knowledgeGroundedChange: 2.1,
  },
  "90d": {
    avgConfidence: 89.8,
    confidenceDistribution: { high: 83, medium: 12, low: 5 },
    lowConfidenceRate: 5.1,
    lowConfidenceChange: 0.9,
    knowledgeGroundedRate: 92.7,
    knowledgeGroundedChange: 3.4,
  },
};

const COMPARISON_LABEL: Record<ChartPeriod, string> = {
  "7d": "Jul 25 – Jul 31",
  "30d": "Jul 12 – Jul 31",
  "90d": "May 3 – Jul 31",
};

const AGENTS = [
  { id: "customer-support", name: "Customer Support", prefix: "cs" },
  { id: "billing-support", name: "Billing Support", prefix: "bs" },
] as const;

const CONVERSATION_SLUGS = [
  "refund",
  "track",
  "warranty",
  "cancel",
  "invoice",
  "password",
  "shipping",
  "giftcard",
  "playground-1",
  "playground-2",
  "tax",
  "loyalty",
  "bulk",
  "localization",
  "api",
  "escalation",
] as const;

const CHANNELS = ["web_chat", "zendesk", "playground"] as const;

const CUSTOMERS = [
  "Avery Chen",
  "Jordan Blake",
  "Samira Patel",
  "Noah Williams",
  "Elena Rossi",
  "Liam O'Connor",
  "Maya Singh",
  "Owen Brooks",
  "Hana Suzuki",
  "Diego Alvarez",
];

const PREVIEWS = [
  "Can I get a refund for last month's charge?",
  "The tracking number still shows as pending.",
  "How do I reset the device after a firmware update?",
  "Your answer didn't match the warranty policy on the site.",
  "I need to change the shipping address on an open order.",
  "Why was my invoice tax calculated twice?",
  "The agent said the item is in stock, but checkout failed.",
  "Can you confirm the international return window?",
  "The pairing code from the app is not being accepted.",
  "I was told a callback was scheduled, but nobody called.",
];

function periodTicketFactor(period: ChartPeriod) {
  if (period === "7d") {
    return 0.28;
  }

  if (period === "90d") {
    return 2.35;
  }

  return 1;
}

function comparisonLabel(period: ChartPeriod) {
  return COMPARISON_LABEL[period];
}

function scaleCountryTickets(period: ChartPeriod): CountryTicketRow[] {
  const factor = periodTicketFactor(period);

  return COUNTRY_TICKETS.map((row) => ({
    ...row,
    tickets: Math.max(1, Math.round(row.tickets * factor)),
  }));
}

function buildAiQuality(period: ChartPeriod) {
  const quality = QUALITY_BY_PERIOD[period];

  return {
    ...quality,
    lowConfidenceDirection: "down" as const,
    knowledgeGroundedDirection: "up" as const,
    lowConfidenceConversationCount: 31,
  };
}

function buildLowConfidenceConversations(
  period: ChartPeriod
): LowConfidenceConversation[] {
  const count = buildAiQuality(period).lowConfidenceConversationCount;
  const countries = COUNTRY_TICKETS.map((row) => row.country);

  return Array.from({ length: count }, (_, index) => {
    const agent = AGENTS[index % AGENTS.length];
    const slug = CONVERSATION_SLUGS[Math.floor(index / AGENTS.length) % CONVERSATION_SLUGS.length];
    const day = 20 - (index % 18);

    return {
      id: `${agent.prefix}-c-${slug}`,
      agentId: agent.id,
      agentName: agent.name,
      customerName: CUSTOMERS[index % CUSTOMERS.length] ?? null,
      preview: PREVIEWS[index % PREVIEWS.length],
      confidence: Number((18 + (index % 27) + (index % 5) * 0.4).toFixed(1)),
      startedAt: `2026-08-${String(day).padStart(2, "0")}T${String(9 + (index % 8)).padStart(2, "0")}:${String((index * 7) % 60).padStart(2, "0")}:00.000Z`,
      country: countries[index % countries.length],
      channel: CHANNELS[index % CHANNELS.length],
    };
  });
}

function buildTimeSeries(period: ChartPeriod) {
  const dayCount = period === "7d" ? 7 : period === "30d" ? 20 : 30;
  const startDay = period === "90d" ? 23 : 1;

  return Array.from({ length: dayCount }, (_, index) => {
    const day = startDay + index;
    const base = period === "7d" ? 680 : 520;
    const growth = period === "7d" ? index * 8 : index * 11;

    return {
      date: `2026-08-${String(day).padStart(2, "0")}`,
      label: `Aug ${day}`,
      value: base + growth + (index % 3) * 5,
    };
  });
}

function buildDashboard(period: ChartPeriod = "30d"): DashboardData {
  const points = buildTimeSeries(period);
  const lastValue = points[points.length - 1]?.value ?? 742;
  const countryTickets = scaleCountryTickets(period);

  return DashboardDataSchema.parse({
    filters: {
      dateRangeLabel:
        period === "7d"
          ? "Aug 14 – Aug 20, 2026"
          : period === "90d"
            ? "May 23 – Aug 20, 2026"
            : "Aug 1 – Aug 20, 2026",
      comparisonLabel: comparisonLabel(period),
      selectedAgentLabel: "All Agents",
    },
    kpis: [
      {
        id: "ai-handled-tickets",
        label: "AI-handled tickets",
        displayValue: "742",
        trend: {
          value: 742,
          change: 12.4,
          changeLabel: `vs ${comparisonLabel(period)}`,
          direction: "up",
          sparkline: sparklineUp,
        },
      },
      {
        id: "ai-resolution-rate",
        label: "AI resolution rate",
        displayValue: "71.4%",
        trend: {
          value: 71.4,
          change: 4.2,
          changeLabel: `vs ${comparisonLabel(period)}`,
          direction: "up",
          sparkline: sparklineResolution,
        },
      },
      {
        id: "human-handoff-rate",
        label: "Human handoff rate",
        displayValue: "28.6%",
        trend: {
          value: 28.6,
          change: 4.2,
          changeLabel: `vs ${comparisonLabel(period)}`,
          direction: "down",
          sparkline: sparklineHandoff,
        },
      },
    ],
    ticketsOverTime: {
      period,
      points,
      summaryValue: lastValue,
      summaryChange: period === "7d" ? 3.1 : period === "90d" ? 18.6 : 12.4,
      summaryDirection: "up",
    },
    countryTickets: countryTickets.slice(0, DASHBOARD_COUNTRY_PREVIEW_LIMIT),
    agentPerformance: [
      {
        id: "customer-support",
        name: "Customer Support",
        icon: "support",
        tickets: 412,
        resolutionRate: 76,
        resolutionChange: 5,
        handoffRate: 24,
        handoffChange: -5,
      },
      {
        id: "billing-support",
        name: "Billing Support",
        icon: "billing",
        tickets: 198,
        resolutionRate: 68,
        resolutionChange: -9,
        handoffRate: 32,
        handoffChange: 9,
      },
      {
        id: "technical-support",
        name: "Technical Support",
        icon: "technical",
        tickets: 132,
        resolutionRate: 72,
        resolutionChange: 2,
        handoffRate: 28,
        handoffChange: -2,
      },
    ],
    aiQuality: buildAiQuality(period),
    needsAttention: [
      {
        id: "knowledge-gaps",
        title: "Knowledge gaps",
        description: "Topics where AI lacks sufficient knowledge",
        icon: "knowledge-gap",
        metricValue: "12",
      },
      {
        id: "knowledge-conflicts",
        title: "Knowledge conflicts",
        description: "Conflicting information detected in knowledge base",
        icon: "conflict",
        metricValue: "4",
      },
      {
        id: "billing-agent",
        title: "Billing Support agent",
        description: "Resolution rate dropped significantly",
        icon: "agent",
        metricValue: "↓ 9%",
        metricDirection: "down",
      },
      {
        id: "zendesk",
        title: "Zendesk integration",
        description: "Connection requires attention",
        icon: "integration",
        statusLabel: "Attention",
        status: "warning",
      },
      {
        id: "usage",
        title: "Usage",
        description: "Conversation usage within plan limits",
        icon: "usage",
        statusLabel: "On track",
        status: "success",
      },
    ],
    recentActivity: ACTIVITY_ITEMS.slice(0, DASHBOARD_ACTIVITY_PREVIEW_LIMIT),
    notificationCount: 3,
  });
}

function sortCountries(
  rows: CountryTicketRow[],
  sortBy: CountrySortBy,
  sortDir: SortDirection
) {
  const direction = sortDir === "asc" ? 1 : -1;

  return [...rows].sort((left, right) => {
    if (sortBy === "country") {
      return left.country.localeCompare(right.country) * direction;
    }

    return (left[sortBy] - right[sortBy]) * direction;
  });
}

export function getDashboardFixture(period: ChartPeriod = "30d"): DashboardData {
  return buildDashboard(period);
}

export function getDashboardCountriesFixture(query: DashboardCountriesQuery) {
  const period = query.period ?? "30d";
  const countries = scaleCountryTickets(period);
  const search = query.query?.trim().toLowerCase();
  const filtered = search
    ? countries.filter((row) => row.country.toLowerCase().includes(search))
    : countries;
  const sorted = sortCountries(filtered, query.sortBy, query.sortDir);
  const totalTickets = countries.reduce((sum, row) => sum + row.tickets, 0);
  const { items, pagination } = paginateItems(
    sorted,
    query.page,
    query.pageSize
  );

  return DashboardCountriesResponseSchema.parse({
    comparisonLabel: comparisonLabel(period),
    totalTickets,
    countryCount: countries.length,
    rows: items.map((row) => ({
      ...row,
      sharePercent:
        totalTickets === 0
          ? 0
          : Number(((row.tickets / totalTickets) * 100).toFixed(1)),
    })),
    pagination,
  });
}

export function getDashboardAiQualityFixture(period: ChartPeriod = "30d") {
  return DashboardAiQualityResponseSchema.parse({
    comparisonLabel: comparisonLabel(period),
    quality: buildAiQuality(period),
  });
}

export function getDashboardAiQualityConversationsFixture(
  query: DashboardAiQualityConversationsQuery
) {
  const period = query.period ?? "30d";
  const conversations = buildLowConfidenceConversations(period).sort(
    (left, right) => left.confidence - right.confidence
  );
  const { items, pagination } = paginateItems(
    conversations,
    query.page,
    query.pageSize
  );

  return DashboardAiQualityConversationsResponseSchema.parse({
    conversations: items,
    pagination,
  });
}

export function getDashboardActivityFixture(query: DashboardActivityQuery) {
  const search = query.query?.trim().toLowerCase();
  const icon = query.icon;
  const filtered = ACTIVITY_ITEMS.filter((item) => {
    if (icon && item.icon !== icon) {
      return false;
    }

    if (!search) {
      return true;
    }

    return [item.title, item.description].some((value) =>
      value.toLowerCase().includes(search)
    );
  });
  const { items, pagination } = paginateItems(
    filtered,
    query.page,
    query.pageSize
  );

  return DashboardActivityResponseSchema.parse({
    items,
    pagination,
  });
}
