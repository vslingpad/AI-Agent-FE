"use client";

import { useState } from "react";
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  InfoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAgentsList } from "@/hooks/use-agents";
import {
  DASHBOARD_PERIOD_OPTIONS,
  DEFAULT_DASHBOARD_PERIOD,
  isCustomDashboardRange,
  toDateInputValue,
} from "@/lib/dashboard/query";
import type { ChartPeriod, DashboardQueryParams } from "@/lib/schemas/dashboard";
import { cn } from "@/lib/utils";

type DashboardFilterControlsProps = {
  query: DashboardQueryParams;
  dateLabel: string;
  agentLabel: string;
  onChange: (query: DashboardQueryParams) => void;
};

export function DashboardFilterControls({
  query,
  dateLabel,
  agentLabel,
  onChange,
}: DashboardFilterControlsProps) {
  return (
    <>
      <DashboardDateFilter
        query={query}
        label={dateLabel}
        onChange={onChange}
      />
      <DashboardAgentFilter
        query={query}
        label={agentLabel}
        onChange={onChange}
      />
    </>
  );
}

function DashboardDateFilter({
  query,
  label,
  onChange,
}: {
  query: DashboardQueryParams;
  label: string;
  onChange: (query: DashboardQueryParams) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(toDateInputValue(query.dateFrom));
  const [draftTo, setDraftTo] = useState(toDateInputValue(query.dateTo));
  const customRange = isCustomDashboardRange(query);
  const inverted = Boolean(draftFrom && draftTo && draftFrom > draftTo);

  const selectPeriod = (period: ChartPeriod) => {
    onChange({
      ...query,
      period,
      dateFrom: undefined,
      dateTo: undefined,
    });
    setOpen(false);
  };

  const applyCustomRange = () => {
    if (inverted) {
      return;
    }

    onChange({
      ...query,
      period: undefined,
      dateFrom: draftFrom || undefined,
      dateTo: draftTo || undefined,
    });
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1">
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            setDraftFrom(toDateInputValue(query.dateFrom));
            setDraftTo(toDateInputValue(query.dateTo));
          }
          setOpen(nextOpen);
        }}
      >
        <PopoverTrigger
          render={<Button variant="outline" size="sm" className="gap-2" />}
        >
          <CalendarIcon className="size-4" />
          {label}
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 gap-3 p-3">
          <div className="flex gap-0.5">
            {DASHBOARD_PERIOD_OPTIONS.map((option) => {
              const selected =
                !customRange && (query.period ?? DEFAULT_DASHBOARD_PERIOD) === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectPeriod(option.value)}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted bg-gray-100",
                    selected && "bg-primary text-primary-foreground"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-2 border-t border-border pt-3">
            <Label>Custom range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="dashboard-date-from" className="text-xs text-muted-foreground">
                  From
                </Label>
                <Input
                  id="dashboard-date-from"
                  type="date"
                  value={draftFrom}
                  onChange={(event) => setDraftFrom(event.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dashboard-date-to" className="text-xs text-muted-foreground">
                  To
                </Label>
                <Input
                  id="dashboard-date-to"
                  type="date"
                  value={draftTo}
                  onChange={(event) => setDraftTo(event.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            {inverted ? (
              <p className="text-xs text-destructive">From must be on or before To.</p>
            ) : null}
            <Button
              size="sm"
              className="w-full"
              disabled={inverted || (!draftFrom && !draftTo)}
              onClick={applyCustomRange}
            >
              Apply dates
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Date range timezone"
            >
              <InfoIcon className="size-3.5" />
            </button>
          }
        />
        <TooltipContent>
          Dates are in UTC timezone.
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function DashboardAgentFilter({
  query,
  label,
  onChange,
}: {
  query: DashboardQueryParams;
  label: string;
  onChange: (query: DashboardQueryParams) => void;
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useAgentsList();
  const agents = data?.agents ?? [];

  const selectAgent = (agentId: string | undefined) => {
    onChange({ ...query, agentId });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="outline" size="sm" className="gap-2" />}
      >
        AI Agent
        <span className="text-muted-foreground">·</span>
        {label}
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-0.5 p-1">
        <button
          type="button"
          onClick={() => selectAgent(undefined)}
          className={cn(
            "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
            !query.agentId && "bg-muted"
          )}
        >
          All Agents
          {!query.agentId ? <CheckIcon className="size-4" /> : null}
        </button>
        <div className="max-h-72 overflow-y-auto">
          {isLoading ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">Loading agents…</p>
          ) : agents.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">No agents yet</p>
          ) : (
            agents.map((agent) => {
              const selected = query.agentId === agent.id;

              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => selectAgent(agent.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                    selected && "bg-muted"
                  )}
                >
                  <span className="truncate">{agent.name}</span>
                  {selected ? <CheckIcon className="size-4 shrink-0" /> : null}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function useDashboardAgentLabel(agentId?: string) {
  const { data } = useAgentsList();

  if (!agentId) {
    return "All Agents";
  }

  return data?.agents.find((agent) => agent.id === agentId)?.name ?? "AI Agent";
}
