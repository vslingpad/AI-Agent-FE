import type { DashboardData } from "@/lib/schemas/dashboard";

function escapeCsv(value: string | number): string {
  const stringValue = String(value);

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function appendSection(
  lines: string[],
  title: string,
  headers: string[],
  rows: (string | number)[][]
) {
  lines.push(title);
  lines.push(headers.map(escapeCsv).join(","));
  rows.forEach((row) => {
    lines.push(row.map(escapeCsv).join(","));
  });
  lines.push("");
}

export function exportDashboardToCsv(data: DashboardData) {
  const lines: string[] = [];

  appendSection(
    lines,
    "KPIs",
    ["Metric", "Value", "Change", "Direction", "Comparison"],
    data.kpis.map((kpi) => [
      kpi.label,
      kpi.displayValue,
      kpi.trend.change,
      kpi.trend.direction,
      kpi.trend.changeLabel,
    ])
  );

  appendSection(
    lines,
    "AI-handled tickets over time",
    ["Date", "Label", "Tickets"],
    data.ticketsOverTime.points.map((point) => [
      point.date,
      point.label,
      point.value,
    ])
  );

  appendSection(
    lines,
    "Country level AI-handled tickets",
    ["Country", "Tickets", "Change %", "Direction"],
    data.countryTickets.map((row) => [
      row.country,
      row.tickets,
      row.changePercent,
      row.direction,
    ])
  );

  appendSection(
    lines,
    "AI agent performance",
    ["Agent", "Tickets", "Resolution rate", "Resolution change", "Handoff rate", "Handoff change"],
    data.agentPerformance.map((row) => [
      row.name,
      row.tickets,
      row.resolutionRate,
      row.resolutionChange,
      row.handoffRate,
      row.handoffChange,
    ])
  );

  appendSection(
    lines,
    "AI quality",
    ["Metric", "Value"],
    [
      ["Avg. answer confidence", `${data.aiQuality.avgConfidence}%`],
      ["High confidence share", `${data.aiQuality.confidenceDistribution.high}%`],
      ["Medium confidence share", `${data.aiQuality.confidenceDistribution.medium}%`],
      ["Low confidence share", `${data.aiQuality.confidenceDistribution.low}%`],
      ["Low-confidence answers", `${data.aiQuality.lowConfidenceRate}%`],
      ["Knowledge-grounded answers", `${data.aiQuality.knowledgeGroundedRate}%`],
      [
        "Low-confidence conversations",
        data.aiQuality.lowConfidenceConversationCount,
      ],
    ]
  );

  appendSection(
    lines,
    "Needs attention",
    ["Title", "Description", "Status", "Metric"],
    data.needsAttention.map((item) => [
      item.title,
      item.description,
      item.statusLabel ?? "",
      item.metricValue ?? "",
    ])
  );

  appendSection(
    lines,
    "Recent activity",
    ["Title", "Description", "Timestamp"],
    data.recentActivity.map((item) => [
      item.title,
      item.description,
      item.timestamp,
    ])
  );

  const sanitizedRange = data.filters.dateRangeLabel
    .replace(/\s+/g, "-")
    .replace(/[^\w-–]/g, "");
  const filename = `dashboard-export-${sanitizedRange}.csv`;
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
