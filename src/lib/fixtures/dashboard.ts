import {
  DashboardDataSchema,
  type ChartPeriod,
  type DashboardData,
} from "@/lib/schemas/dashboard";

const sparklineUp = [520, 545, 560, 590, 610, 635, 660, 680, 700, 720, 735, 742];
const sparklineResolution = [62, 64, 65, 66, 67, 68, 69, 70, 70.5, 71, 71.2, 71.4];
const sparklineHandoff = [38, 36, 35, 34, 33, 32, 31, 30.5, 29.8, 29.2, 28.8, 28.6];

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

  return DashboardDataSchema.parse({
    filters: {
      dateRangeLabel: "Aug 1 – Aug 20, 2026",
      comparisonLabel: "Jul 12 – Jul 31",
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
          changeLabel: "vs Jul 12 – Jul 31",
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
          changeLabel: "vs Jul 12 – Jul 31",
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
          changeLabel: "vs Jul 12 – Jul 31",
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
    countryTickets: [
      { country: "United States", tickets: 312, changePercent: 15.3, direction: "up" },
      { country: "United Kingdom", tickets: 156, changePercent: 8.7, direction: "up" },
      { country: "Canada", tickets: 98, changePercent: 11.2, direction: "up" },
      { country: "Australia", tickets: 76, changePercent: 2.1, direction: "down" },
      { country: "Germany", tickets: 54, changePercent: 6.4, direction: "up" },
    ],
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
    aiQuality: {
      avgConfidence: 91.2,
      confidenceDistribution: { high: 86, medium: 10, low: 4 },
      lowConfidenceRate: 4.2,
      lowConfidenceChange: 0.6,
      lowConfidenceDirection: "down",
      knowledgeGroundedRate: 94.1,
      knowledgeGroundedChange: 2.1,
      knowledgeGroundedDirection: "up",
      lowConfidenceConversationCount: 31,
    },
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
    recentActivity: [
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
    ],
    notificationCount: 3,
  });
}

export function getDashboardFixture(period: ChartPeriod = "30d"): DashboardData {
  return buildDashboard(period);
}
