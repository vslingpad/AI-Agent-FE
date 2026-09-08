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
import type {
  ChartPeriod,
  DashboardActivityQuery,
  DashboardAiQualityConversationsQuery,
  DashboardAiQualityQuery,
  DashboardCountriesQuery,
} from "@/lib/schemas/dashboard";

export function useDashboard(params: { period?: ChartPeriod } = {}) {
  const { organization, isLoaded } = useOrganization();
  const period = params.period ?? "30d";

  return useQuery({
    queryKey: ["dashboard", organization?.id, period],
    queryFn: () => getDashboard({ period }),
    enabled: isLoaded && Boolean(organization?.id),
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
    queryKey: ["dashboard", organization?.id, "ai-quality", query.period],
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
