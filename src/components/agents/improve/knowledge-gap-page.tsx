"use client";

import { useEffect, useMemo, useState } from "react";
import { BookPlusIcon, CheckCircle2Icon } from "lucide-react";
import { AddKnowledgeQnaDialog } from "@/components/agents/build/knowledge/dialogs/add-knowledge-qna-dialog";
import { AgentErrorState, AgentImproveSkeleton } from "@/components/agents/agent-states";
import { ConversationDetailPanel } from "@/components/agents/conversations/conversation-detail-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  useAgent,
  useAgentConversations,
  useAgentImprove,
  useResolveKnowledgeGap,
  useUpdateAgentKnowledge,
} from "@/hooks/use-agents";
import { formatLastSyncAttempt } from "@/lib/integrations/connector-paths";
import { truncateText } from "@/lib/conversations/conversation-utils";
import type { ImproveItem } from "@/lib/schemas/agents";
import { cn } from "@/lib/utils";

type GapTab = "open" | "resolved";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

function KnowledgeGapListItem({
  item,
  selected,
  onSelect,
}: {
  item: ImproveItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full flex-col items-start gap-1.5 px-4 py-3 text-left text-sm hover:bg-muted/60",
          selected && "bg-muted"
        )}
      >
        <span className="text-[11px] text-muted-foreground">
          {formatLastSyncAttempt(item.createdAt)}
        </span>
        <p className="line-clamp-2 text-xs text-foreground">
          {truncateText(item.description, 140)}
        </p>
      </button>
    </li>
  );
}

export function AgentKnowledgeGapPage({ agentId }: { agentId: string }) {
  const [tab, setTab] = useState<GapTab>("open");
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
  } = useAgentImprove(agentId, {
    kind: "knowledge-gap",
    status: tab,
    page,
    pageSize,
  });
  const resolveGap = useResolveKnowledgeGap(agentId);
  const updateKnowledge = useUpdateAgentKnowledge(agentId);

  const items = improve?.items ?? [];
  const pagination = improve?.pagination;

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedItem =
    items.find((item) => item.id === selectedItemId) ?? items[0] ?? null;

  const conversationQuery = useMemo(
    () =>
      selectedItem?.conversationId
        ? {
            conversationId: selectedItem.conversationId,
            page: 1,
            pageSize: 20,
          }
        : undefined,
    [selectedItem?.conversationId]
  );

  const { data: conversationData, isLoading: conversationLoading } =
    useAgentConversations(agentId, conversationQuery, {
      enabled: Boolean(conversationQuery?.conversationId),
    });

  const conversation = conversationData?.conversations[0] ?? null;

  const [reviseDefaults, setReviseDefaults] = useState<{
    title: string;
    questions: string[];
    answer: string;
  } | null>(null);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedItemId(null);
      return;
    }
    if (!selectedItemId || !items.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(items[0]?.id ?? null);
    }
  }, [items, selectedItemId]);

  if (agentLoading || improveLoading) {
    return <AgentImproveSkeleton />;
  }

  if (agentError || improveError || !agent || !improve) {
    return (
      <AgentErrorState
        message="Unable to load knowledge gaps."
        onRetry={() => {
          void refetchAgent();
          void refetchImprove();
        }}
      />
    );
  }

  const pageStart = pagination ? (pagination.page - 1) * pagination.pageSize : 0;

  const handleMarkResolved = () => {
    if (!selectedItem?.conversationId) {
      return;
    }
    resolveGap.mutate(selectedItem.conversationId);
  };

  return (
    <div className="flex h-[calc(100svh-var(--notification-banner-height)-3.5rem)] min-h-[32rem] flex-col">
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Knowledge Gap
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Questions the agent could not answer confidently from retrieval. Add
            Q&A or articles, then mark gaps resolved.
          </p>
        </div>
        <Tabs
          className="shrink-0"
          value={tab}
          onValueChange={(value) => setTab(value as GapTab)}
        >
          <TabsList>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <p className="text-sm font-medium">
              {tab === "open" ? "No open knowledge gaps" : "No resolved gaps yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {agent.status === "draft"
                ? "Gaps appear after live or playground conversations with low-confidence replies."
                : tab === "open"
                  ? "When the agent is unsure, conversations show up here for review."
                  : "Resolved gaps appear after you mark them handled."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 lg:grid-cols-[350px_1fr]">
          <ul className="min-h-0 flex-1 divide-y overflow-y-auto border-r border-border">
            {items.map((item) => (
              <KnowledgeGapListItem
                key={item.id}
                item={item}
                selected={selectedItem?.id === item.id}
                onSelect={() => setSelectedItemId(item.id)}
              />
            ))}
          </ul>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {selectedItem ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-4 py-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 text-sm font-medium break-words">
                        {selectedItem.title}
                      </p>
                      <Badge
                        className="shrink-0"
                        variant={
                          selectedItem.status === "resolved"
                            ? "success"
                            : "warning"
                        }
                      >
                        {selectedItem.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.suggestedAction}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setReviseDefaults({
                          title: selectedItem.title.slice(0, 80),
                          questions: [selectedItem.title],
                          answer: "",
                        })
                      }
                    >
                      <BookPlusIcon className="size-4" />
                      Add Q&A
                    </Button>
                    {selectedItem.status !== "resolved" &&
                    selectedItem.conversationId ? (
                      <Button
                        size="sm"
                        onClick={handleMarkResolved}
                        disabled={resolveGap.isPending}
                      >
                        <CheckCircle2Icon className="size-4" />
                        Mark resolved
                      </Button>
                    ) : null}
                  </div>
                </div>

                {conversationLoading ? (
                  <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                    Loading conversation…
                  </div>
                ) : conversation ? (
                  <ConversationDetailPanel
                    conversation={conversation}
                    agentName={agent.name}
                    onReviseAnswer={(defaults) =>
                      setReviseDefaults({
                        title: defaults.title || selectedItem.title.slice(0, 80),
                        questions: [defaults.question],
                        answer: defaults.answer,
                      })
                    }
                  />
                ) : (
                  <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                    Conversation transcript is not available for this item.
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {pagination && pagination.totalItems > 0 ? (
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageStart={pageStart}
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          rowsLabel="Per page"
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize as (typeof PAGE_SIZE_OPTIONS)[number]);
            setPage(1);
          }}
        />
      ) : null}

      <AddKnowledgeQnaDialog
        key={reviseDefaults?.questions.join("|") ?? "closed"}
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
