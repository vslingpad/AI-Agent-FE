"use client";

import { useUser } from "@clerk/nextjs";
import {
  BellIcon,
  DownloadIcon,
  HelpCircleIcon,
} from "lucide-react";
import { DashboardFilterControls } from "@/components/dashboard/dashboard-filters";
import { Button } from "@/components/ui/button";
import type { DashboardData, DashboardQueryParams } from "@/lib/schemas/dashboard";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

type DashboardHeaderProps = {
  filters: DashboardData["filters"];
  query: DashboardQueryParams;
  onFiltersChange: (query: DashboardQueryParams) => void;
  notificationCount: number;
  onExport: () => void;
  isExporting?: boolean;
};

export function DashboardHeader({
  filters,
  query,
  onFiltersChange,
  notificationCount,
  onExport,
  isExporting = false,
}: DashboardHeaderProps) {
  const { user } = useUser();
  const firstName = user?.firstName ?? "there";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your AI support today.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DashboardFilterControls
          query={query}
          dateLabel={filters.dateRangeLabel}
          agentLabel={filters.selectedAgentLabel}
          onChange={onFiltersChange}
        />

        <Button
          variant="outline"
          size="icon-sm"
          className="relative"
          aria-label="Notifications"
        >
          <BellIcon />
          {notificationCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {notificationCount}
            </span>
          ) : null}
        </Button>

        <Button variant="outline" size="icon-sm" aria-label="Help">
          <HelpCircleIcon />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onExport}
          disabled={isExporting}
        >
          <DownloadIcon className="size-4" />
          {isExporting ? "Exporting…" : "Export"}
        </Button>
      </div>
    </div>
  );
}
