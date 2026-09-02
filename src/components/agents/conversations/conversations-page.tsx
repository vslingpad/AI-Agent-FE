"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AddKnowledgeQnaDialog } from "@/components/agents/build/knowledge/dialogs/add-knowledge-qna-dialog";
import { ConversationDetailPanel } from "@/components/agents/conversations/conversation-detail-panel";
import { ConversationFiltersBar } from "@/components/agents/conversations/conversation-filters-bar";
import { ConversationList } from "@/components/agents/conversations/conversation-list";
import { PAGE_SIZE_OPTIONS } from "@/components/agents/conversations/conversation-labels";
import { AgentConversationsSkeleton, AgentErrorState } from "@/components/agents/agent-states";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  useAgent,
  useAgentConversationLocations,
  useAgentConversations,
  useUpdateAgentKnowledge,
} from "@/hooks/use-agents";
import { exportAgentConversations } from "@/lib/api/agents";
import type { ConversationQuery } from "@/lib/schemas/agents";

function parseFilters(searchParams: URLSearchParams): ConversationQuery {
  const pageSizeParam = Number(searchParams.get("pageSize"));
  const pageParam = Number(searchParams.get("page"));
  const billableParam = searchParams.get("billable");
  const knowledgeGapParam = searchParams.get("knowledgeGap");

  return {
    customer: searchParams.get("customer") ?? undefined,
    conversationId: searchParams.get("conversationId") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    location: searchParams.get("location") ?? undefined,
    channel: (searchParams.get("channel") ?? undefined) as ConversationQuery["channel"],
    status: (searchParams.get("status") ?? undefined) as ConversationQuery["status"],
    billable:
      billableParam === "true"
        ? true
        : billableParam === "false"
          ? false
          : undefined,
    knowledgeGap:
      knowledgeGapParam === "true"
        ? true
        : knowledgeGapParam === "false"
          ? false
          : undefined,
    page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
    pageSize:
      PAGE_SIZE_OPTIONS.includes(pageSizeParam as (typeof PAGE_SIZE_OPTIONS)[number])
        ? pageSizeParam
        : 20,
  };
}

function filtersToSearchParams(filters: ConversationQuery) {
  const params = new URLSearchParams();

  if (filters.customer) {
    params.set("customer", filters.customer);
  }

  if (filters.conversationId) {
    params.set("conversationId", filters.conversationId);
  }

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  if (filters.location) {
    params.set("location", filters.location);
  }

  if (filters.channel) {
    params.set("channel", filters.channel);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.billable !== undefined) {
    params.set("billable", String(filters.billable));
  }

  if (filters.knowledgeGap !== undefined) {
    params.set("knowledgeGap", String(filters.knowledgeGap));
  }

  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  if (filters.pageSize && filters.pageSize !== 20) {
    params.set("pageSize", String(filters.pageSize));
  }

  return params;
}

export function AgentConversationsPage({ agentId }: { agentId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const { data: agent } = useAgent(agentId);
  const {
    data: locationOptions,
    isLoading: locationsLoading,
  } = useAgentConversationLocations(agentId);
  const { data, isLoading, isError, refetch } = useAgentConversations(agentId, filters);
  const updateKnowledge = useUpdateAgentKnowledge(agentId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviseDefaults, setReviseDefaults] = useState<{
    title: string;
    question: string;
    answer: string;
  } | null>(null);
  const [exporting, setExporting] = useState(false);

  const conversations = data?.conversations ?? [];
  const pagination = data?.pagination;

  const selected = useMemo(() => {
    return (
      conversations.find((conversation) => conversation.id === selectedId) ??
      conversations[0] ??
      null
    );
  }, [conversations, selectedId]);

  useEffect(() => {
    if (conversations.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !conversations.some((conversation) => conversation.id === selectedId)) {
      setSelectedId(conversations[0]?.id ?? null);
    }
  }, [conversations, selectedId]);

  const updateFilters = (nextFilters: ConversationQuery) => {
    const params = filtersToSearchParams(nextFilters);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const blob = await exportAgentConversations(agentId, {
        customer: filters.customer,
        conversationId: filters.conversationId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        location: filters.location,
        channel: filters.channel,
        status: filters.status,
        billable: filters.billable,
        knowledgeGap: filters.knowledgeGap,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "conversations-export.csv";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return <AgentConversationsSkeleton />;
  }

  if (isError || !data || !pagination) {
    return (
      <AgentErrorState
        message="Unable to load conversations."
        onRetry={() => refetch()}
      />
    );
  }

  const pageStart = (pagination.page - 1) * pagination.pageSize;

  return (
    <div className="flex h-[calc(100svh-var(--notification-banner-height)-3.5rem)] min-h-[32rem] flex-col">
      <ConversationFiltersBar
        filters={filters}
        locationOptions={locationOptions?.locations ?? []}
        locationsLoading={locationsLoading}
        onFiltersChange={updateFilters}
        onSearchChange={(value) =>
          updateFilters({
            ...filtersRef.current,
            customer: value,
            conversationId: value,
            page: 1,
          })
        }
        onExport={() => void handleExport()}
        exporting={exporting}
      />

      {conversations.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <p className="text-sm font-medium">No conversations match these filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try clearing filters or wait for live channel traffic.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 lg:grid-cols-[350px_1fr]">
          <ConversationList
            conversations={conversations}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
          />

          {selected ? (
            <ConversationDetailPanel
              conversation={selected}
              agentName={agent?.name}
              onReviseAnswer={(defaults) => setReviseDefaults(defaults)}
            />
          ) : null}
        </div>
      )}

      {pagination.totalItems > 0 ? (
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageStart={pageStart}
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={(page) => updateFilters({ ...filters, page })}
          onPageSizeChange={(pageSize) =>
            updateFilters({ ...filters, pageSize, page: 1 })
          }
          rowsLabel="Per page"
        />
      ) : null}

      <AddKnowledgeQnaDialog
        key={reviseDefaults?.question ?? "closed"}
        open={reviseDefaults !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReviseDefaults(null);
          }
        }}
        defaults={reviseDefaults ?? undefined}
        submitLabel="Save Q&A"
        onSubmit={(input) => {
          updateKnowledge.mutate(
            { addQna: input },
            {
              onSuccess: () => setReviseDefaults(null),
            }
          );
        }}
        pending={updateKnowledge.isPending}
      />
    </div>
  );
}
