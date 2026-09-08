"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutTemplateIcon, PencilIcon, PlusIcon, SlidersHorizontalIcon, Trash2Icon } from "lucide-react";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentErrorState, AgentProceduresSkeleton } from "@/components/agents/agent-states";
import { ProcedureDetailSheet } from "@/components/agents/build/procedures/procedure-detail-sheet";
import { ProcedureFormDialog } from "@/components/agents/build/procedures/procedure-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useAgentProcedures,
  useDeleteAgentProcedure,
  useProcedureTriggerWarnings,
  useUpdateAgentProcedures,
} from "@/hooks/use-agents";
import { formatLastSyncAttempt } from "@/lib/integrations/connector-paths";
import type { AgentProcedureBinding } from "@/lib/schemas/agents";

export function AgentProceduresPage({ agentId }: { agentId: string }) {
  const { data, isLoading, isError, refetch } = useAgentProcedures(agentId);
  const { data: warningsData } = useProcedureTriggerWarnings(agentId);
  const updateProcedures = useUpdateAgentProcedures(agentId);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] =
    useState<AgentProcedureBinding | null>(null);
  const [detailProcedure, setDetailProcedure] =
    useState<AgentProcedureBinding | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AgentProcedureBinding | null>(
    null
  );

  const openCreate = () => {
    setEditingProcedure(null);
    setFormOpen(true);
  };

  const openEdit = (procedure: AgentProcedureBinding) => {
    setEditingProcedure(procedure);
    setFormOpen(true);
  };

  const openDetail = (procedure: AgentProcedureBinding) => {
    setDetailProcedure(procedure);
    setDetailOpen(true);
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
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            render={<Link href={`/agents/${agentId}/build/procedures/templates`} />}
          >
            <LayoutTemplateIcon />
            Templates
          </Button>
          <Button onClick={openCreate}>
            <PlusIcon />
            Add procedure
          </Button>
        </div>
      }
    >
      {warningsData?.warnings.length ? (
        <div className="mb-4 max-w-5xl space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
          <p className="font-medium">Overlapping triggers</p>
          {warningsData.warnings.map((warning) => (
            <p key={warning.procedureIds.join("-")} className="text-muted-foreground">
              {warning.message}
            </p>
          ))}
        </div>
      ) : null}
      {data.procedures.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm font-medium">No procedures yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a procedure when the agent should follow a fixed sequence —
            collect details, call APIs, then respond or hand off.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            <PlusIcon />
            Add procedure
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-w-5xl">
          {data.procedures.map((procedure) => (
            <Card key={procedure.id}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{procedure.name}</p>
                    <Badge variant={procedure.status === "live" ? "success" : "muted"}>
                      {procedure.status === "live" ? "Live" : "Draft"}
                    </Badge>
                    {procedure.enabled ? (
                      <Badge variant="outline">Enabled</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{procedure.whenToUse}</p>
                  <p className="text-xs text-muted-foreground">
                    {procedure.stepCount} steps
                    {procedure.lastSimulatedAt
                      ? ` · last simulation ${formatLastSyncAttempt(procedure.lastSimulatedAt)}`
                      : " · not simulated yet"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`proc-${procedure.id}`} className="text-sm">
                      Enable
                    </Label>
                    <Switch
                      id={`proc-${procedure.id}`}
                      checked={procedure.enabled}
                      disabled={
                        procedure.status !== "live" || updateProcedures.isPending
                      }
                      onCheckedChange={(checked) =>
                        updateProcedures.mutate({
                          procedureId: procedure.id,
                          procedureEnabled: checked,
                        })
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Manage ${procedure.name}`}
                    onClick={() => openDetail(procedure)}
                  >
                    <SlidersHorizontalIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Edit ${procedure.name}`}
                    onClick={() => openEdit(procedure)}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Delete ${procedure.name}`}
                    onClick={() => setDeleteTarget(procedure)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProcedureFormDialog
        agentId={agentId}
        open={formOpen}
        onOpenChange={setFormOpen}
        procedure={editingProcedure}
      />

      <ProcedureDetailSheet
        agentId={agentId}
        procedure={detailProcedure}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={() => {
          if (detailProcedure) {
            setDetailOpen(false);
            openEdit(detailProcedure);
          }
        }}
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

function DeleteProcedureDialog({
  agentId,
  procedure,
  open,
  onOpenChange,
}: {
  agentId: string;
  procedure: AgentProcedureBinding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteProcedure = useDeleteAgentProcedure(agentId);

  const handleDelete = async () => {
    if (!procedure) {
      return;
    }

    await deleteProcedure.mutateAsync(procedure.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete procedure</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{procedure?.name}</span>{" "}
            will be removed from this agent. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteProcedure.isPending}
          >
            {deleteProcedure.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
