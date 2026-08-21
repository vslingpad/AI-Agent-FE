"use client";

import { useUser } from "@clerk/nextjs";
import {
  BellIcon,
  CalendarIcon,
  ChevronDownIcon,
  DownloadIcon,
  HelpCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardData } from "@/lib/schemas/dashboard";

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
  notificationCount: number;
  onExport: () => void;
  isExporting?: boolean;
};

export function DashboardHeader({
  filters,
  notificationCount,
  onExport,
  isExporting = false,
}: DashboardHeaderProps) {
  const { user } = useUser();
  const firstName = user?.firstName ?? "there";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-1 pl-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your AI support today.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarIcon className="size-4" />
          {filters.dateRangeLabel}
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </Button>

        <Button variant="outline" size="sm" className="gap-2">
          AI Agent
          <span className="text-muted-foreground">·</span>
          {filters.selectedAgentLabel}
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </Button>

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
