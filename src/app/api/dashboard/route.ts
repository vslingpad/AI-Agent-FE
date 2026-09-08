import { NextResponse } from "next/server";
import { apiError, requireOrgId } from "@/lib/api/auth";
import {
  ControlPlaneAuthError,
  controlPlaneFetch,
  detailToError,
  isPlainObject,
  jsonFromResponse,
  keysToCamel,
} from "@/lib/api/control-plane";
import {
  DashboardDataSchema,
  ChartPeriodSchema,
  type ChartPeriod,
  type DashboardData,
  type NeedsAttentionItem,
} from "@/lib/schemas/dashboard";

function backendError(status: number, body: unknown) {
  if (isPlainObject(body) && "detail" in body) {
    return apiError(detailToError(body.detail), status);
  }

  return apiError("Request failed", status);
}

function periodLabel(period: ChartPeriod) {
  if (period === "7d") {
    return "Last 7 days";
  }

  if (period === "90d") {
    return "Last 90 days";
  }

  return "Last 30 days";
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function composeDashboard(
  agentsPayload: unknown,
  usagePayload: unknown,
  period: ChartPeriod
): DashboardData {
  const agentsRoot = isPlainObject(keysToCamel(agentsPayload))
    ? (keysToCamel(agentsPayload) as Record<string, unknown>)
    : {};
  const agents = Array.isArray(agentsRoot.agents) ? agentsRoot.agents : [];
  const usage = isPlainObject(keysToCamel(usagePayload))
    ? (keysToCamel(usagePayload) as Record<string, unknown>)
    : {};

  const rows = agents.flatMap((item) => {
    if (!isPlainObject(item)) {
      return [];
    }

    const icon = item.icon;
    return [
      {
        id: asString(item.id),
        name: asString(item.name, "Agent"),
        icon:
          icon === "billing" || icon === "technical" || icon === "support"
            ? icon
            : ("support" as const),
        tickets: asNumber(item.tickets),
        resolutionRate: asNumber(item.resolutionRate),
        handoffRate: asNumber(item.handoffRate),
      },
    ];
  });

  const totalTickets = rows.reduce((sum, row) => sum + row.tickets, 0);
  const avgResolution =
    rows.length === 0
      ? 0
      : rows.reduce((sum, row) => sum + row.resolutionRate, 0) / rows.length;
  const avgHandoff =
    rows.length === 0
      ? 0
      : rows.reduce((sum, row) => sum + row.handoffRate, 0) / rows.length;
  const remaining = asNumber(usage.planIncludedRemaining) + asNumber(usage.freeRemaining);
  const included = asNumber(usage.planIncludedTotal);
  const billed = asNumber(usage.conversationsBilledThisPeriod);
  const today = new Date().toISOString().slice(0, 10);
  const needsAttention: NeedsAttentionItem[] = [];

  if (usage.canAnswer === false) {
    needsAttention.push({
      id: "usage-blocked",
      title: "Conversation credits unavailable",
      description: asString(
        usage.blockedReason,
        "This organization cannot start new AI conversations."
      ),
      icon: "usage" as const,
      status: "critical" as const,
      statusLabel: "Blocked",
    });
  } else if (included > 0 && remaining / included <= 0.2) {
    needsAttention.push({
      id: "usage-low",
      title: "Credits running low",
      description: `${remaining} of ${included} included conversations remain this period.`,
      icon: "usage" as const,
      status: "warning" as const,
      metricValue: String(remaining),
    });
  }

  return DashboardDataSchema.parse({
    filters: {
      dateRangeLabel: periodLabel(period),
      comparisonLabel: asString(usage.planName, "Current plan"),
      selectedAgentLabel: "All Agents",
    },
    kpis: [
      {
        id: "ai-handled-tickets",
        label: "AI-handled tickets",
        displayValue: String(totalTickets || billed),
        trend: {
          value: totalTickets || billed,
          change: 0,
          changeLabel: periodLabel(period),
          direction: "neutral",
          sparkline: [totalTickets || billed],
        },
      },
      {
        id: "ai-resolution-rate",
        label: "AI resolution rate",
        displayValue: `${Math.round(avgResolution)}%`,
        trend: {
          value: avgResolution,
          change: 0,
          changeLabel: periodLabel(period),
          direction: "neutral",
          sparkline: [avgResolution],
        },
      },
      {
        id: "human-handoff-rate",
        label: "Human handoff rate",
        displayValue: `${Math.round(avgHandoff)}%`,
        trend: {
          value: avgHandoff,
          change: 0,
          changeLabel: periodLabel(period),
          direction: "neutral",
          sparkline: [avgHandoff],
        },
      },
    ],
    ticketsOverTime: {
      period,
      points: [
        {
          date: today,
          label: "Now",
          value: totalTickets || billed,
        },
      ],
      summaryValue: totalTickets || billed,
      summaryChange: 0,
      summaryDirection: "neutral",
    },
    countryTickets: [],
    agentPerformance: rows.map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      tickets: row.tickets,
      resolutionRate: row.resolutionRate,
      resolutionChange: 0,
      handoffRate: row.handoffRate,
      handoffChange: 0,
    })),
    aiQuality: {
      avgConfidence: 0,
      confidenceDistribution: { high: 0, medium: 0, low: 0 },
      lowConfidenceRate: 0,
      lowConfidenceChange: 0,
      lowConfidenceDirection: "neutral",
      knowledgeGroundedRate: 0,
      knowledgeGroundedChange: 0,
      knowledgeGroundedDirection: "neutral",
      lowConfidenceConversationCount: 0,
    },
    needsAttention,
    recentActivity: [],
    notificationCount: needsAttention.length,
  });
}

export async function GET(request: Request) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  const { searchParams } = new URL(request.url);
  const parsedPeriod = ChartPeriodSchema.safeParse(
    searchParams.get("period") ?? "30d"
  );

  if (!parsedPeriod.success) {
    return apiError("Invalid period");
  }

  try {
    const [agentsResponse, usageResponse] = await Promise.all([
      controlPlaneFetch("/agents"),
      controlPlaneFetch("/billing/usage"),
    ]);

    const agentsPayload = await jsonFromResponse(agentsResponse);
    if (!agentsResponse.ok) {
      return backendError(agentsResponse.status, agentsPayload);
    }

    const usagePayload = await jsonFromResponse(usageResponse);
    if (!usageResponse.ok) {
      return backendError(usageResponse.status, usagePayload);
    }

    return NextResponse.json(
      composeDashboard(agentsPayload, usagePayload, parsedPeriod.data)
    );
  } catch (error) {
    if (error instanceof ControlPlaneAuthError) {
      return apiError("Unauthorized", 401);
    }

    console.error("Dashboard compose failed", error);
    return apiError("Control plane unavailable", 502);
  }
}
