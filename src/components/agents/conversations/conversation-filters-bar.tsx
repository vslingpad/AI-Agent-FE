"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DownloadIcon, ListFilterIcon, SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CHANNEL_LABEL,
  STATUS_LABEL,
} from "@/components/agents/conversations/conversation-labels";
import type { ConversationLocationOption, ConversationQuery } from "@/lib/schemas/agents";

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type ConversationFiltersBarProps = {
  filters: ConversationQuery;
  locationOptions: ConversationLocationOption[];
  locationsLoading?: boolean;
  onFiltersChange: (filters: ConversationQuery) => void;
  onSearchChange: (search: string | undefined) => void;
  onExport: () => void;
  exporting?: boolean;
};

function countActiveFilters(filters: ConversationQuery) {
  let count = 0;

  if (filters.dateFrom || filters.dateTo) {
    count += 1;
  }

  if (filters.location) {
    count += 1;
  }

  if (filters.channel) {
    count += 1;
  }

  if (filters.status) {
    count += 1;
  }

  if (filters.billable !== undefined) {
    count += 1;
  }

  if (filters.knowledgeGap !== undefined) {
    count += 1;
  }

  return count;
}

export function ConversationFiltersBar({
  filters,
  locationOptions,
  locationsLoading = false,
  onFiltersChange,
  onSearchChange,
  onExport,
  exporting = false,
}: ConversationFiltersBarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const searchQuery = filters.customer ?? filters.conversationId ?? "";
  const [searchValue, setSearchValue] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draft, setDraft] = useState({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    location: filters.location,
    channel: filters.channel,
    status: filters.status,
    billable: filters.billable,
    knowledgeGap: filters.knowledgeGap,
  });

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  useEffect(() => {
    setSearchValue(filters.customer ?? filters.conversationId ?? "");
  }, [filters.customer, filters.conversationId]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (filterOpen) {
      setDraft({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        location: filters.location,
        channel: filters.channel,
        status: filters.status,
        billable: filters.billable,
        knowledgeGap: filters.knowledgeGap,
      });
    }
  }, [filterOpen, filters]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearchChange(value.trim() || undefined);
    }, 300);
  };

  const applyFilters = () => {
    onFiltersChange({
      ...filters,
      ...draft,
      page: 1,
    });
    setFilterOpen(false);
  };

  const clearFilters = () => {
    const cleared = {
      dateFrom: undefined,
      dateTo: undefined,
      location: undefined,
      channel: undefined,
      status: undefined,
      billable: undefined,
      knowledgeGap: undefined,
    };
    setDraft(cleared);
    onFiltersChange({
      ...filters,
      ...cleared,
      page: 1,
    });
    setFilterOpen(false);
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
      <h1 className="font-heading text-lg font-semibold">Conversations</h1>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-56 sm:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by customer or conversation ID…"
            className="h-9 pl-8"
          />
        </div>

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm" className="relative">
                <ListFilterIcon className="size-4" />
                Filters
                {activeFilterCount > 0 ? (
                  <Badge
                    variant="secondary"
                    className="ml-1 size-5 justify-center rounded-full px-0 text-[10px]"
                  >
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
            }
          />

          <PopoverContent align="end" className="w-80 space-y-1.5 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Filter conversations</p>
              <p className="text-xs text-muted-foreground">
                Narrow the list by date, channel, status, and flags.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Date range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label
                      htmlFor="conversation-filter-date-from"
                      className="text-xs text-muted-foreground"
                    >
                      From
                    </Label>
                    <Input
                      id="conversation-filter-date-from"
                      type="date"
                      value={draft.dateFrom ?? ""}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          dateFrom: event.target.value || undefined,
                        }))
                      }
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="conversation-filter-date-to"
                      className="text-xs text-muted-foreground"
                    >
                      To
                    </Label>
                    <Input
                      id="conversation-filter-date-to"
                      type="date"
                      value={draft.dateTo ?? ""}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          dateTo: event.target.value || undefined,
                        }))
                      }
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="conversation-filter-location">Location</Label>
                <select
                  id="conversation-filter-location"
                  value={draft.location ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      location: event.target.value || undefined,
                    }))
                  }
                  className={selectClassName}
                  disabled={locationsLoading}
                >
                  <option value="">All locations</option>
                  {locationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="conversation-filter-channel">Channel</Label>
                <select
                  id="conversation-filter-channel"
                  value={draft.channel ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      channel: (event.target.value ||
                        undefined) as ConversationQuery["channel"],
                    }))
                  }
                  className={selectClassName}
                >
                  <option value="">All channels</option>
                  {Object.entries(CHANNEL_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="conversation-filter-status">Status</Label>
                <select
                  id="conversation-filter-status"
                  value={draft.status ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      status: (event.target.value ||
                        undefined) as ConversationQuery["status"],
                    }))
                  }
                  className={selectClassName}
                >
                  <option value="">All statuses</option>
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="conversation-filter-billable">Billable</Label>
                <select
                  id="conversation-filter-billable"
                  value={
                    draft.billable === undefined
                      ? ""
                      : draft.billable
                        ? "true"
                        : "false"
                  }
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      billable:
                        event.target.value === ""
                          ? undefined
                          : event.target.value === "true",
                    }))
                  }
                  className={selectClassName}
                >
                  <option value="">All</option>
                  <option value="true">Billable</option>
                  <option value="false">Not billable</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="conversation-filter-knowledge-gap">Knowledge gap</Label>
                <select
                  id="conversation-filter-knowledge-gap"
                  value={
                    draft.knowledgeGap === undefined
                      ? ""
                      : draft.knowledgeGap
                        ? "true"
                        : "false"
                  }
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      knowledgeGap:
                        event.target.value === ""
                          ? undefined
                          : event.target.value === "true",
                    }))
                  }
                  className={selectClassName}
                >
                  <option value="">All</option>
                  <option value="true">Knowledge gap</option>
                  <option value="false">No knowledge gap</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
              <Button size="sm" onClick={applyFilters}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="sm" onClick={onExport} disabled={exporting}>
          <DownloadIcon className="size-4" />
          {exporting ? "Exporting…" : "Export"}
        </Button>
      </div>
    </header>
  );
}
