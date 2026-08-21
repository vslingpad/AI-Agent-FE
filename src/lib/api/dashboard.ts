import { apiGet } from "@/lib/api/client";
import {
  DashboardDataSchema,
  DashboardQueryParamsSchema,
  type ChartPeriod,
  type DashboardData,
} from "@/lib/schemas/dashboard";

export async function getDashboard(
  params: { period?: ChartPeriod; agentId?: string } = {}
): Promise<DashboardData> {
  const parsedParams = DashboardQueryParamsSchema.parse(params);
  const json = await apiGet<unknown>("/api/dashboard", {
    period: parsedParams.period,
    agentId: parsedParams.agentId,
  });

  return DashboardDataSchema.parse(json);
}
