"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChartPeriod } from "@/lib/schemas/dashboard";

const PERIODS: { value: ChartPeriod; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

export function DashboardSubpageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        className="h-auto gap-1 p-0 text-muted-foreground"
        render={<Link href="/" />}
      >
        <ArrowLeftIcon className="size-4" />
        Back to dashboard
      </Button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

export function DashboardPeriodToggle({
  value,
  onChange,
}: {
  value: ChartPeriod | null;
  onChange: (period: ChartPeriod) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
      {PERIODS.map((period) => (
        <Button
          key={period.value}
          variant={value === period.value ? "secondary" : "ghost"}
          size="xs"
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}

export function DashboardSubpageError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
