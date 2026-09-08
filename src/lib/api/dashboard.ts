import { apiGet } from "@/lib/api/client";
import {
  DashboardActivityQuerySchema,
  DashboardActivityResponseSchema,
  DashboardAiQualityConversationsQuerySchema,
  DashboardAiQualityConversationsResponseSchema,
  DashboardAiQualityQuerySchema,
  DashboardAiQualityResponseSchema,
  DashboardCountriesQuerySchema,
  DashboardCountriesResponseSchema,
  DashboardDataSchema,
  DashboardQueryParamsSchema,
  type ChartPeriod,
  type DashboardActivityQuery,
  type DashboardActivityResponse,
  type DashboardAiQualityConversationsQuery,
  type DashboardAiQualityConversationsResponse,
  type DashboardAiQualityQuery,
  type DashboardAiQualityResponse,
  type DashboardCountriesQuery,
  type DashboardCountriesResponse,
  type DashboardData,
} from "@/lib/schemas/dashboard";

function toQueryParams(
  params: Record<string, string | number | undefined>
): Record<string, string | undefined> {
  const query: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query[key] = String(value);
    }
  }

  return query;
}

export async function getDashboard(
  params: { period?: ChartPeriod; agentId?: string } = {}
): Promise<DashboardData> {
  const parsedParams = DashboardQueryParamsSchema.parse(params);
  const json = await apiGet<unknown>(
    "/api/dashboard",
    toQueryParams({
      period: parsedParams.period,
      agentId: parsedParams.agentId,
    })
  );

  return DashboardDataSchema.parse(json);
}

export async function getDashboardCountries(
  params: DashboardCountriesQuery
): Promise<DashboardCountriesResponse> {
  const parsed = DashboardCountriesQuerySchema.parse(params);
  const json = await apiGet<unknown>(
    "/api/dashboard/countries",
    toQueryParams(parsed)
  );

  return DashboardCountriesResponseSchema.parse(json);
}

export async function getDashboardAiQuality(
  params: DashboardAiQualityQuery = {}
): Promise<DashboardAiQualityResponse> {
  const parsed = DashboardAiQualityQuerySchema.parse(params);
  const json = await apiGet<unknown>(
    "/api/dashboard/ai-quality",
    toQueryParams(parsed)
  );

  return DashboardAiQualityResponseSchema.parse(json);
}

export async function getDashboardAiQualityConversations(
  params: DashboardAiQualityConversationsQuery
): Promise<DashboardAiQualityConversationsResponse> {
  const parsed = DashboardAiQualityConversationsQuerySchema.parse(params);
  const json = await apiGet<unknown>(
    "/api/dashboard/ai-quality/conversations",
    toQueryParams(parsed)
  );

  return DashboardAiQualityConversationsResponseSchema.parse(json);
}

export async function getDashboardActivity(
  params: DashboardActivityQuery
): Promise<DashboardActivityResponse> {
  const parsed = DashboardActivityQuerySchema.parse(params);
  const json = await apiGet<unknown>(
    "/api/dashboard/activity",
    toQueryParams(parsed)
  );

  return DashboardActivityResponseSchema.parse(json);
}
