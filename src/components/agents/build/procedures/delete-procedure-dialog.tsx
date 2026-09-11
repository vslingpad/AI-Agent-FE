"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteAgentProcedure } from "@/hooks/use-agents";
import type { AgentProcedureBinding } from "@/lib/schemas/agents";

export function DeleteProcedureDialog({
  agentId,
  procedure,
  open,
  onOpenChange,
  onDeleted,
}: {
  agentId: string;
  procedure: AgentProcedureBinding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const deleteProcedure = useDeleteAgentProcedure(agentId);

  const handleDelete = async () => {
    if (!procedure) {
      return;
    }

    await deleteProcedure.mutateAsync(procedure.id);
    onOpenChange(false);
    onDeleted?.();
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
            onClick={() => void handleDelete()}
            disabled={deleteProcedure.isPending}
          >
            {deleteProcedure.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
