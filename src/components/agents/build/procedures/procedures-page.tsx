"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  EllipsisVerticalIcon,
  LayoutTemplateIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentErrorState, AgentProceduresSkeleton } from "@/components/agents/agent-states";
import { DeleteProcedureDialog } from "@/components/agents/build/procedures/delete-procedure-dialog";
import { ProcedureFormDialog } from "@/components/agents/build/procedures/procedure-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  useAgentProcedures,
  useProcedureTriggerWarnings,
  useUpdateAgentProcedures,
} from "@/hooks/use-agents";
import { formatLastSyncAttempt } from "@/lib/integrations/connector-paths";
import type { AgentProcedureBinding } from "@/lib/schemas/agents";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export function procedureDetailPath(agentId: string, procedureId: string) {
  return `/agents/${agentId}/build/procedures/${procedureId}`;
}

export function AgentProceduresPage({ agentId }: { agentId: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useAgentProcedures(agentId);
  const { data: warningsData } = useProcedureTriggerWarnings(agentId);
  const updateProcedures = useUpdateAgentProcedures(agentId);
  const [formOpen, setFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [deleteTarget, setDeleteTarget] = useState<AgentProcedureBinding | null>(
    null
  );

  const filteredProcedures = useMemo(() => {
    const list = data?.procedures ?? [];
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return list;
    }

    return list.filter((procedure) =>
      [procedure.name, procedure.whenToUse]
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [data?.procedures, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProcedures.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = filteredProcedures.slice(pageStart, pageStart + pageSize);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize as (typeof PAGE_SIZE_OPTIONS)[number]);
    setPage(1);
  };

  const openDetail = (procedureId: string) => {
    router.push(procedureDetailPath(agentId, procedureId));
  };

  if (isLoading) {
    return <AgentProceduresSkeleton />;
  }

  if (isError || !data) {
    return (
      <AgentErrorState
        message="Unable to load procedures."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <AgentPageFrame
      title="Procedures"
      description="Multi-step SOPs this agent follows for a matched intent. Procedures call actions; they do not replace them."
      actions={
        <>
          <div className="relative w-full sm:w-56">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search procedures…"
              className="h-9 pl-8"
              aria-label="Search procedures"
            />
          </div>
          <Button
            variant="outline"
            render={<Link href={`/agents/${agentId}/build/procedures/templates`} />}
          >
            <LayoutTemplateIcon />
            Templates
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon />
            Add procedure
          </Button>
        </>
      }
    >
      {warningsData?.warnings.length ? (
        <div className="mb-4 space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
          <p className="font-medium">Overlapping triggers</p>
          {warningsData.warnings.map((warning) => (
            <p key={warning.procedureIds.join("-")} className="text-muted-foreground">
              {warning.message}
            </p>
          ))}
        </div>
      ) : null}

      {procedures.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm font-medium">No procedures yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a procedure when the agent should follow a fixed sequence —
            collect details, call APIs, then respond or hand off.
          </p>
          <Button className="mt-4" onClick={() => setFormOpen(true)}>
            <PlusIcon />
            Add procedure
          </Button>
        </div>
      ) : (
        <Card className="overflow-hidden py-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Procedure</th>
                  <th className="px-5 py-3 font-medium">Steps</th>
                  <th className="px-5 py-3 font-medium">Last simulated</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Enabled</th>
                  <th className="w-16 px-5 py-3 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-muted-foreground"
                    >
                      No procedures match this search.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((procedure) => {
                    const href = procedureDetailPath(agentId, procedure.id);

                    return (
                      <tr
                        key={procedure.id}
                        className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/40"
                        onClick={() => openDetail(procedure.id)}
                      >
                        <td className="max-w-md px-5 py-3 align-middle">
                          <Link
                            href={href}
                            className="font-medium hover:underline"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {procedure.name}
                          </Link>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {procedure.whenToUse}
                          </p>
                        </td>
                        <td className="px-5 py-3 align-middle text-muted-foreground">
                          {procedure.stepCount} steps
                        </td>
                        <td className="px-5 py-3 align-middle text-muted-foreground">
                          {procedure.lastSimulatedAt
                            ? `${formatLastSyncAttempt(procedure.lastSimulatedAt)}`
                            : "not simulated yet"}
                        </td>
                        <td className="px-5 py-3 align-middle">
                          <Badge
                            variant={procedure.status === "live" ? "success" : "muted"}
                          >
                            {procedure.status === "live" ? "Live" : "Draft"}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 align-middle">
                          {procedure.status === "live" ? (
                            <span onClick={(event) => event.stopPropagation()}>
                              <Switch
                                checked={procedure.enabled}
                                disabled={updateProcedures.isPending}
                                aria-label={`Enable ${procedure.name}`}
                                onCheckedChange={(checked) =>
                                  updateProcedures.mutate({
                                    procedureId: procedure.id,
                                    procedureEnabled: checked,
                                  })
                                }
                              />
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td
                          className="px-5 py-3 align-middle"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex justify-end">
                            <ProcedureActionsMenu
                              procedureName={procedure.name}
                              onEdit={() => openDetail(procedure.id)}
                              onDelete={() => setDeleteTarget(procedure)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredProcedures.length > 0 ? (
            <TablePagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={filteredProcedures.length}
              pageStart={pageStart}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          ) : null}
        </Card>
      )}

      <ProcedureFormDialog
        agentId={agentId}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <DeleteProcedureDialog
        agentId={agentId}
        procedure={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      />
    </AgentPageFrame>
  );
}

function ProcedureActionsMenu({
  procedureName,
  onEdit,
  onDelete,
}: {
  procedureName: string;
  onEdit: () => void;
  onDelete: () => void;
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
            aria-label={`${procedureName} actions`}
          />
        }
      >
        <EllipsisVerticalIcon className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 gap-0.5 p-1">
        <ActionMenuItem
          label="Edit"
          onClick={() => {
            close();
            onEdit();
          }}
        />
        <ActionMenuItem
          label="Delete"
          destructive
          onClick={() => {
            close();
            onDelete();
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function ActionMenuItem({
  label,
  destructive,
  onClick,
}: {
  label: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted",
        destructive ? "text-destructive" : "text-foreground"
      )}
    >
      {label}
    </button>
  );
}
