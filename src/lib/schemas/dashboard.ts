import { z } from "zod";
import { ConversationChannelSchema } from "@/lib/schemas/agents";

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
  statusLabel: z.string().nullish(),
  status: AttentionStatusSchema.nullish(),
  metricValue: z.string().nullish(),
  metricDirection: TrendDirectionSchema.nullish(),
});

export const ActivityIconSchema = z.enum([
  "document",
  "lightbulb",
  "link",
  "clipboard",
]);

export const RecentActivityItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  icon: ActivityIconSchema,
});

export const DashboardPaginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

export const CountrySortBySchema = z.enum(["country", "tickets", "changePercent"]);
export const SortDirectionSchema = z.enum(["asc", "desc"]);

export const DashboardCountriesQuerySchema = z.object({
  period: ChartPeriodSchema.optional(),
  query: z.string().trim().optional(),
  sortBy: CountrySortBySchema.default("tickets"),
  sortDir: SortDirectionSchema.default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const CountryTicketDetailRowSchema = CountryTicketRowSchema.extend({
  sharePercent: z.number(),
});

export const DashboardCountriesResponseSchema = z.object({
  comparisonLabel: z.string(),
  totalTickets: z.number(),
  countryCount: z.number(),
  rows: z.array(CountryTicketDetailRowSchema),
  pagination: DashboardPaginationSchema,
});

export const DashboardAiQualityQuerySchema = z.object({
  period: ChartPeriodSchema.optional(),
});

export const DashboardAiQualityResponseSchema = z.object({
  comparisonLabel: z.string(),
  quality: AiQualitySchema,
});

export const LowConfidenceConversationSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  customerName: z.string().nullable(),
  preview: z.string(),
  confidence: z.number(),
  startedAt: z.string(),
  country: z.string(),
  channel: ConversationChannelSchema,
});

export const DashboardAiQualityConversationsQuerySchema = z.object({
  period: ChartPeriodSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const DashboardAiQualityConversationsResponseSchema = z.object({
  conversations: z.array(LowConfidenceConversationSchema),
  pagination: DashboardPaginationSchema,
});

export const DashboardActivityQuerySchema = z.object({
  query: z.string().trim().optional(),
  icon: ActivityIconSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const DashboardActivityResponseSchema = z.object({
  items: z.array(RecentActivityItemSchema),
  pagination: DashboardPaginationSchema,
});

export const DASHBOARD_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

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
export type ActivityIcon = z.infer<typeof ActivityIconSchema>;
export type RecentActivityItem = z.infer<typeof RecentActivityItemSchema>;
export type DashboardData = z.infer<typeof DashboardDataSchema>;
export type DashboardPagination = z.infer<typeof DashboardPaginationSchema>;
export type CountrySortBy = z.infer<typeof CountrySortBySchema>;
export type SortDirection = z.infer<typeof SortDirectionSchema>;
export type DashboardCountriesQuery = z.infer<typeof DashboardCountriesQuerySchema>;
export type CountryTicketDetailRow = z.infer<typeof CountryTicketDetailRowSchema>;
export type DashboardCountriesResponse = z.infer<
  typeof DashboardCountriesResponseSchema
>;
export type DashboardAiQualityQuery = z.infer<typeof DashboardAiQualityQuerySchema>;
export type DashboardAiQualityResponse = z.infer<
  typeof DashboardAiQualityResponseSchema
>;
export type LowConfidenceConversation = z.infer<
  typeof LowConfidenceConversationSchema
>;
export type DashboardAiQualityConversationsQuery = z.infer<
  typeof DashboardAiQualityConversationsQuerySchema
>;
export type DashboardAiQualityConversationsResponse = z.infer<
  typeof DashboardAiQualityConversationsResponseSchema
>;
export type DashboardActivityQuery = z.infer<typeof DashboardActivityQuerySchema>;
export type DashboardActivityResponse = z.infer<
  typeof DashboardActivityResponseSchema
>;

export const DashboardQueryParamsSchema = z.object({
  period: ChartPeriodSchema.optional(),
  agentId: z.string().optional(),
});

export type DashboardQueryParams = z.infer<typeof DashboardQueryParamsSchema>;
