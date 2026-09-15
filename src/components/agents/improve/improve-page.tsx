"use client";

import { useState } from "react";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentErrorState, AgentImproveSkeleton } from "@/components/agents/agent-states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TablePagination } from "@/components/ui/table-pagination";
import { useAgent, useAgentImprove } from "@/hooks/use-agents";
import { formatLastSyncAttempt } from "@/lib/integrations/connector-paths";
import type { ImproveKind, ImproveStatus } from "@/lib/schemas/agents";

const COPY: Record<
  ImproveKind,
  { title: string; description: string }
> = {
  "knowledge-gap": {
    title: "Knowledge Gap",
    description:
      "Questions the agent could not answer from retrieval. Add Q&A, a file, or a Help Center article.",
  },
  "knowledge-conflict": {
    title: "Knowledge Conflict",
    description:
      "Sources that disagree. Resolve the canonical answer so the agent stops mixing policies.",
  },
  "duplicate-content": {
    title: "Duplicate Content",
    description:
      "Overlapping articles or files that teach the same topic with different wording.",
  },
  "missing-action": {
    title: "Missing Action",
    description:
      "Turns where the agent needed a live API call (order, subscription, gift card) and did not have a tool.",
  },
  "missing-procedure": {
    title: "Missing Procedure",
    description:
      "Multi-step work the LLM improvised. Author a procedure so the order of tools is pinned.",
  },
};

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const STATUS_VARIANT: Record<ImproveStatus, "warning" | "muted" | "success"> = {
  open: "warning",
  reviewing: "muted",
  resolved: "success",
};

export function AgentImprovePage({
  agentId,
  kind,
}: {
  agentId: string;
  kind: ImproveKind;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20);
  const {
    data: agent,
    isLoading: agentLoading,
    isError: agentError,
    refetch: refetchAgent,
  } = useAgent(agentId);
  const {
    data: improve,
    isLoading: improveLoading,
    isError: improveError,
    refetch: refetchImprove,
  } = useAgentImprove(agentId, { kind, page, pageSize });
  const copy = COPY[kind];

  if (agentLoading || improveLoading) {
    return <AgentImproveSkeleton />;
  }

  if (agentError || improveError || !agent || !improve) {
    return (
      <AgentErrorState message="Unable to load suggestions." onRetry={() => {
        void refetchAgent();
        void refetchImprove();
      }} />
    );
  }

  const items = improve.items;
  const { pagination } = improve;
  const pageStart = (pagination.page - 1) * pagination.pageSize;

  return (
    <AgentPageFrame title={copy.title} description={copy.description}>
      {pagination.totalItems === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm font-medium">Nothing to review</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {agent.status === "draft"
              ? "Suggestions appear after live or playground conversations."
              : "No open items in this category."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <Badge variant={STATUS_VARIANT[item.status]}>{item.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.occurrences} conversation
                    {item.occurrences === 1 ? "" : "s"}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatLastSyncAttempt(item.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Suggested: </span>
                  {item.suggestedAction}
                </p>
              </CardContent>
            </Card>
          ))}
          {pagination.totalItems > 0 ? (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageStart={pageStart}
              pageSize={pagination.pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPageSize(nextPageSize as (typeof PAGE_SIZE_OPTIONS)[number]);
                setPage(1);
              }}
            />
          ) : null}
        </div>
      )}
    </AgentPageFrame>
  );
}
