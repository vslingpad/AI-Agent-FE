import { z } from "zod";

export const TrendDirectionSchema = z.enum(["up", "down", "neutral"]);

export const MetricTrendSchema = z.object({
  value: z.number(),
  change: z.number(),
  changeLabel: z.string(),
  direction: TrendDirectionSchema,
  sparkline: z.array(z.number()),
});

export const KpiMetricSchema = z.object({
  id: z.string(),
  label: z.string(),
  displayValue: z.string(),
  trend: MetricTrendSchema,
});

export const ChartPeriodSchema = z.enum(["7d", "30d", "90d"]);

export const TimeSeriesPointSchema = z.object({
  date: z.string(),
  label: z.string(),
  value: z.number(),
});

export const CountryTicketRowSchema = z.object({
  country: z.string(),
  tickets: z.number(),
  changePercent: z.number(),
  direction: TrendDirectionSchema,
});

export const AgentPerformanceRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.enum(["support", "billing", "technical"]),
  tickets: z.number(),
  resolutionRate: z.number(),
  resolutionChange: z.number(),
  handoffRate: z.number(),
  handoffChange: z.number(),
});

export const ConfidenceDistributionSchema = z.object({
  high: z.number(),
  medium: z.number(),
  low: z.number(),
});

export const AiQualitySchema = z.object({
  avgConfidence: z.number(),
  confidenceDistribution: ConfidenceDistributionSchema,
  lowConfidenceRate: z.number(),
  lowConfidenceChange: z.number(),
  lowConfidenceDirection: TrendDirectionSchema,
  knowledgeGroundedRate: z.number(),
  knowledgeGroundedChange: z.number(),
  knowledgeGroundedDirection: TrendDirectionSchema,
  lowConfidenceConversationCount: z.number(),
});

export const AttentionStatusSchema = z.enum([
  "default",
  "warning",
  "success",
  "critical",
]);

export const NeedsAttentionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.enum([
    "knowledge-gap",
    "conflict",
    "agent",
    "integration",
    "usage",
  ]),
  statusLabel: z.string().optional(),
  status: AttentionStatusSchema.optional(),
  metricValue: z.string().optional(),
  metricDirection: TrendDirectionSchema.optional(),
});

export const RecentActivityItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  icon: z.enum(["document", "lightbulb", "link", "clipboard"]),
});

export const DashboardFiltersSchema = z.object({
  dateRangeLabel: z.string(),
  comparisonLabel: z.string(),
  selectedAgentLabel: z.string(),
});

export const DashboardDataSchema = z.object({
  filters: DashboardFiltersSchema,
  kpis: z.array(KpiMetricSchema),
  ticketsOverTime: z.object({
    period: ChartPeriodSchema,
    points: z.array(TimeSeriesPointSchema),
    summaryValue: z.number(),
    summaryChange: z.number(),
    summaryDirection: TrendDirectionSchema,
  }),
  countryTickets: z.array(CountryTicketRowSchema),
  agentPerformance: z.array(AgentPerformanceRowSchema),
  aiQuality: AiQualitySchema,
  needsAttention: z.array(NeedsAttentionItemSchema),
  recentActivity: z.array(RecentActivityItemSchema),
  notificationCount: z.number(),
});

export type TrendDirection = z.infer<typeof TrendDirectionSchema>;
export type MetricTrend = z.infer<typeof MetricTrendSchema>;
export type KpiMetric = z.infer<typeof KpiMetricSchema>;
export type ChartPeriod = z.infer<typeof ChartPeriodSchema>;
export type TimeSeriesPoint = z.infer<typeof TimeSeriesPointSchema>;
export type CountryTicketRow = z.infer<typeof CountryTicketRowSchema>;
export type AgentPerformanceRow = z.infer<typeof AgentPerformanceRowSchema>;
export type AiQuality = z.infer<typeof AiQualitySchema>;
export type NeedsAttentionItem = z.infer<typeof NeedsAttentionItemSchema>;
export type RecentActivityItem = z.infer<typeof RecentActivityItemSchema>;
export type DashboardData = z.infer<typeof DashboardDataSchema>;

export const DashboardQueryParamsSchema = z.object({
  period: ChartPeriodSchema.optional(),
  agentId: z.string().optional(),
});

export type DashboardQueryParams = z.infer<typeof DashboardQueryParamsSchema>;
