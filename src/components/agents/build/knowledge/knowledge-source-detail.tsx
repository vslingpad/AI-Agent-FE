"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronLeftIcon,
  ChevronRight,
  EllipsisVerticalIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUpdateAgentKnowledge } from "@/hooks/use-agents";
import { formatLastSyncAttempt } from "@/lib/integrations/connector-paths";
import type {
  KnowledgeOptionKind,
  KnowledgeResource,
  KnowledgeSource,
} from "@/lib/schemas/agents";
import { cn } from "@/lib/utils";
import { AddKnowledgeFileDialog } from "@/components/agents/build/knowledge/dialogs/add-knowledge-file-dialog";
import { AddKnowledgeQnaDialog } from "@/components/agents/build/knowledge/dialogs/add-knowledge-qna-dialog";
import { AddKnowledgeWebsiteDialog } from "@/components/agents/build/knowledge/dialogs/add-knowledge-website-dialog";
import { ViewKnowledgeQnaDialog } from "@/components/agents/build/knowledge/dialogs/view-knowledge-qna-dialog";

type AddDialog = "files" | "website" | "qna" | null;

type QnaResource = Extract<KnowledgeResource, { type: "qna" }>;

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;
const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "trained", label: "Trained" },
  { value: "untrained", label: "Untrained" },
] as const;

type StatusFilter = (typeof STATUS_FILTER_OPTIONS)[number]["value"];

type KnowledgeSourceDetailProps = {
  agentId: string;
  source: KnowledgeSource;
  onBack: () => void;
};

type ResourceAction = "train" | "untrain" | "remove";
type TrainingStatus = "pending" | "trained" | "untrained";

export function KnowledgeSourceDetail({
  agentId,
  source,
  onBack,
}: KnowledgeSourceDetailProps) {
  const updateKnowledge = useUpdateAgentKnowledge(agentId);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const isNative =
    source.kind === "website" ||
    source.kind === "files" ||
    source.kind === "qna";
  const isQnaSource = source.kind === "qna";
  const [viewingQna, setViewingQna] = useState<QnaResource | null>(null);
  const [addDialog, setAddDialog] = useState<AddDialog>(null);

  const rows = useMemo(
    () => source.resources.map((resource) => normalizeResource(resource)),
    [source.resources]
  );
  const showToolbar = isNative || rows.length > 0;

  const filteredRows = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return [row.name, row.subtitle, row.addedBy, row.searchText]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized));
    });
  }, [rows, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = filteredRows.slice(pageStart, pageStart + pageSize);
  const count = sourceItemCount(source);

  const runAction = (resourceIds: string[], action: ResourceAction) => {
    if (resourceIds.length === 0) {
      return;
    }

    updateKnowledge.mutate({
      knowledgeResourceAction: {
        sourceId: source.id,
        resourceIds,
        action,
      },
    });
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit" onClick={onBack}>
          <ChevronLeftIcon className="size-4" />
          Back to knowledge
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <IntegrationBrandIcon slug={source.vendorSlug ?? source.slug} />
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                {source.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {resourceCountLabel(source.kind, count)}
                {source.instanceName ? ` · ${source.instanceName}` : ""}
                {source.lastSyncedAt
                  ? ` · synced ${formatLastSyncAttempt(source.lastSyncedAt)}`
                  : ""}
              </p>
            </div>
          </div>

          {showToolbar ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center lg:shrink-0">
              <div className="relative w-full sm:w-56">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search resources…"
                  className="h-9 pl-8"
                  aria-label="Search resources"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="shrink-0">Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    handleStatusFilterChange(event.target.value as StatusFilter)
                  }
                  className="h-9 min-w-36 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-label="Filter by status"
                >
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {isNative ? (
                <Button
                  size="sm"
                  className="h-9 shrink-0"
                  onClick={() => {
                    if (
                      source.kind === "website" ||
                      source.kind === "files" ||
                      source.kind === "qna"
                    ) {
                      setAddDialog(source.kind);
                    }
                  }}
                >
                  <PlusIcon className="size-4" />
                  {addItemButtonLabel(source.kind)}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium">No resources yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add content to this source so the agent can retrieve it.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-4">
            {filteredRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
                <p className="text-sm font-medium">No matches found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search term or status filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">
                        {isQnaSource ? "Topic" : "Name"}
                      </th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 pr-4 font-medium">Last updated</th>
                      {isNative ? (
                        <th className="pb-3 pr-4 font-medium">Added by</th>
                      ) : null}
                      <th className="w-12 pb-3 font-medium">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pageRows.map((row) => (
                      <tr key={row.id}>
                        <td className="max-w-xs py-3 pr-4 align-middle">
                          <p className="truncate font-medium">{row.name}</p>
                          {row.subtitle ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {row.subtitle}
                            </p>
                          ) : null}
                        </td>
                        <td className="py-3 pr-4 align-middle">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="py-3 pr-4 align-middle text-muted-foreground">
                          {formatLastSyncAttempt(row.updatedAt)}
                        </td>
                        {isNative ? (
                          <td className="py-3 pr-4 align-middle text-muted-foreground">
                            {row.addedBy ?? "—"}
                          </td>
                        ) : null}
                        <td className="py-3 align-middle">
                          <ResourceActionsMenu
                            status={row.status}
                            isNative={isNative}
                            pending={updateKnowledge.isPending}
                            onView={getResourceViewAction(row.resource, setViewingQna)}
                            onTrain={() => runAction([row.id], "train")}
                            onUntrain={() => runAction([row.id], "untrain")}
                            onRemove={() => runAction([row.id], "remove")}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredRows.length > 0 ? (
              <TablePagination
                page={currentPage}
                totalPages={totalPages}
                totalItems={filteredRows.length}
                pageStart={pageStart}
                pageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            ) : null}
          </CardContent>
        </Card>
      )}

      <ViewKnowledgeQnaDialog
        resource={viewingQna}
        onOpenChange={(open) => {
          if (!open) {
            setViewingQna(null);
          }
        }}
      />

      <AddKnowledgeWebsiteDialog
        open={addDialog === "website"}
        onOpenChange={(open) => !open && setAddDialog(null)}
        pending={updateKnowledge.isPending}
        onSubmit={(url) => {
          updateKnowledge.mutate({ addUrl: url });
          setAddDialog(null);
        }}
      />

      <AddKnowledgeFileDialog
        open={addDialog === "files"}
        onOpenChange={(open) => !open && setAddDialog(null)}
        pending={updateKnowledge.isPending}
        onSubmit={(names) => {
          updateKnowledge.mutate({ addFile: { names } });
          setAddDialog(null);
        }}
      />

      <AddKnowledgeQnaDialog
        open={addDialog === "qna"}
        onOpenChange={(open) => !open && setAddDialog(null)}
        pending={updateKnowledge.isPending}
        submitLabel="Add Q&A"
        onSubmit={(input) => updateKnowledge.mutate({ addQna: input })}
      />
    </div>
  );
}

function ResourceActionsMenu({
  status,
  isNative,
  pending,
  onView,
  onTrain,
  onUntrain,
  onRemove,
}: {
  status: TrainingStatus;
  isNative: boolean;
  pending: boolean;
  onView?: () => void;
  onTrain: () => void;
  onUntrain: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            aria-label="Resource actions"
          />
        }
      >
        <EllipsisVerticalIcon className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 gap-0.5 p-1">
        {onView ? (
          <ActionMenuItem
            label="View"
            onClick={() => {
              close();
              onView();
            }}
          />
        ) : null}
        {status === "trained" ? (
          <ActionMenuItem
            label="Untrain"
            disabled={pending}
            onClick={() => {
              close();
              onUntrain();
            }}
          />
        ) : status === "untrained" ? (
          <ActionMenuItem
            label="Train"
            disabled={pending}
            onClick={() => {
              close();
              onTrain();
            }}
          />
        ) : null}
        {isNative ? (
          <ActionMenuItem
            label="Remove"
            destructive
            disabled={pending}
            onClick={() => {
              close();
              onRemove();
            }}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function ActionMenuItem({
  label,
  disabled,
  destructive,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50",
        destructive ? "text-destructive" : "text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function TablePagination({
  page,
  totalPages,
  totalItems,
  pageStart,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageStart: number;
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const rangeStart = totalItems === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center gap-3">
        <p>
          Showing {rangeStart}–{rangeEnd} of {totalItems}
        </p>
        <label className="flex items-center gap-2">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="tabular-nums">
          Page {page} of {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

type NormalizedResourceRow = {
  id: string;
  name: string;
  subtitle: string | null;
  searchText: string | null;
  status: TrainingStatus;
  updatedAt: string;
  addedBy: string | null;
  resource: KnowledgeResource;
};

function normalizeResource(resource: KnowledgeResource): NormalizedResourceRow {
  const status = getTrainingStatus(resource);

  switch (resource.type) {
    case "url":
      return {
        id: resource.id,
        name: resource.title,
        subtitle: resource.url,
        searchText: null,
        status,
        updatedAt: resource.updatedAt,
        addedBy: resource.addedBy,
        resource,
      };
    case "file":
      return {
        id: resource.id,
        name: resource.name,
        subtitle: resource.sizeLabel,
        searchText: null,
        status,
        updatedAt: resource.updatedAt,
        addedBy: resource.addedBy,
        resource,
      };
    case "qna": {
      const questions = resource.questions?.length
        ? resource.questions
        : [resource.question];

      return {
        id: resource.id,
        name: resource.title,
        subtitle: `${questions.length} ${questions.length === 1 ? "question" : "questions"}`,
        searchText: questions.join(" "),
        status,
        updatedAt: resource.updatedAt,
        addedBy: resource.addedBy,
        resource,
      };
    }
    case "article":
      return {
        id: resource.id,
        name: resource.title,
        subtitle: resource.collection,
        searchText: null,
        status,
        updatedAt: resource.updatedAt,
        addedBy: null,
        resource,
      };
    case "ticket":
      return {
        id: resource.id,
        name: resource.subject,
        subtitle: null,
        searchText: null,
        status,
        updatedAt: resource.updatedAt,
        addedBy: null,
        resource,
      };
  }
}

function getResourceViewAction(
  resource: KnowledgeResource,
  onViewQna: (resource: QnaResource) => void
): (() => void) | undefined {
  switch (resource.type) {
    case "qna":
      return () => onViewQna(resource);
    default:
      return undefined;
  }
}

function getTrainingStatus(resource: KnowledgeResource): TrainingStatus {
  if (resource.trained) {
    return "trained";
  }

  switch (resource.type) {
    case "url":
      return resource.status === "crawling" ? "pending" : "untrained";
    case "file":
      return resource.status === "processing" ? "pending" : "untrained";
    case "article":
      return resource.status === "pending" ? "pending" : "untrained";
    case "qna":
    case "ticket":
      return "untrained";
  }
}

function StatusBadge({ status }: { status: TrainingStatus }) {
  const variant =
    status === "trained"
      ? "success"
      : status === "pending"
        ? "warning"
        : "muted";
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return <Badge variant={variant}>{label}</Badge>;
}

function addItemButtonLabel(kind: KnowledgeOptionKind) {
  switch (kind) {
    case "website":
      return "Add website";
    case "files":
      return "Add files";
    case "qna":
      return "Add Q&A";
    default:
      return "Add";
  }
}

function sourceItemCount(source: KnowledgeSource) {
  if (source.kind === "help_center" && source.collections.length > 0) {
    return source.collections.reduce(
      (sum, collection) => sum + collection.articleCount,
      0
    );
  }

  if (source.kind === "website") {
    return source.resources.reduce(
      (sum, resource) =>
        resource.type === "url" ? sum + resource.pageCount : sum,
      0
    );
  }

  return source.resources.length;
}

function resourceCountLabel(kind: KnowledgeOptionKind, count: number) {
  const formatted = count.toLocaleString();

  switch (kind) {
    case "website":
      return `${formatted} ${count === 1 ? "page" : "pages"}`;
    case "files":
      return `${formatted} ${count === 1 ? "file" : "files"}`;
    case "qna":
      return `${formatted} ${count === 1 ? "Q&A" : "Q&As"}`;
    case "tickets":
      return `${formatted} ${count === 1 ? "ticket" : "tickets"}`;
    case "help_center":
      return `${formatted} ${count === 1 ? "article" : "articles"}`;
  }
}
