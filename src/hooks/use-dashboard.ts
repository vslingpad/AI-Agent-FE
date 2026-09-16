"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useOrganization } from "@clerk/nextjs";
import {
  getDashboard,
  getDashboardActivity,
  getDashboardAiQuality,
  getDashboardAiQualityConversations,
  getDashboardCountries,
} from "@/lib/api/dashboard";
import { DEFAULT_DASHBOARD_PERIOD } from "@/lib/dashboard/query";
import type {
  DashboardActivityQuery,
  DashboardAiQualityConversationsQuery,
  DashboardAiQualityQuery,
  DashboardCountriesQuery,
  DashboardQueryParams,
} from "@/lib/schemas/dashboard";

export function useDashboard(params: DashboardQueryParams = {}) {
  const { organization, isLoaded } = useOrganization();
  const period = params.period ?? DEFAULT_DASHBOARD_PERIOD;

  return useQuery({
    queryKey: [
      "dashboard",
      organization?.id,
      period,
      params.agentId,
      params.dateFrom,
      params.dateTo,
    ],
    queryFn: () => getDashboard(params),
    enabled: isLoaded && Boolean(organization?.id),
    placeholderData: keepPreviousData,
  });
}

export function useDashboardCountries(query: DashboardCountriesQuery) {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: [
      "dashboard",
      organization?.id,
      "countries",
      query.period,
      query.agentId,
      query.dateFrom,
      query.dateTo,
      query.query,
      query.sortBy,
      query.sortDir,
      query.page,
      query.pageSize,
    ],
    queryFn: () => getDashboardCountries(query),
    enabled: isLoaded && Boolean(organization?.id),
    placeholderData: keepPreviousData,
  });
}

export function useDashboardAiQuality(query: DashboardAiQualityQuery = {}) {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: [
      "dashboard",
      organization?.id,
      "ai-quality",
      query.period,
      query.agentId,
      query.dateFrom,
      query.dateTo,
    ],
    queryFn: () => getDashboardAiQuality(query),
    enabled: isLoaded && Boolean(organization?.id),
    placeholderData: keepPreviousData,
  });
}

export function useDashboardAiQualityConversations(
  query: DashboardAiQualityConversationsQuery
) {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: [
      "dashboard",
      organization?.id,
      "ai-quality",
      "conversations",
      query.period,
      query.agentId,
      query.dateFrom,
      query.dateTo,
      query.page,
      query.pageSize,
    ],
    queryFn: () => getDashboardAiQualityConversations(query),
    enabled: isLoaded && Boolean(organization?.id),
    placeholderData: keepPreviousData,
  });
}

export function useDashboardActivity(query: DashboardActivityQuery) {
  const { organization, isLoaded } = useOrganization();

  return useQuery({
    queryKey: [
      "dashboard",
      organization?.id,
      "activity",
      query.period,
      query.agentId,
      query.dateFrom,
      query.dateTo,
      query.query,
      query.icon,
      query.page,
      query.pageSize,
    ],
    queryFn: () => getDashboardActivity(query),
    enabled: isLoaded && Boolean(organization?.id),
    placeholderData: keepPreviousData,
  });
}
