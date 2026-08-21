"use client";

import { useQuery } from "@tanstack/react-query";
import { useOrganization } from "@clerk/nextjs";
import { getDashboard } from "@/lib/api/dashboard";
import type { ChartPeriod } from "@/lib/schemas/dashboard";

export function useDashboard(params: { period?: ChartPeriod } = {}) {
  const { organization, isLoaded } = useOrganization();
  const period = params.period ?? "30d";

  return useQuery({
    queryKey: ["dashboard", organization?.id, period],
    queryFn: () => getDashboard({ period }),
    enabled: isLoaded,
  });
}
