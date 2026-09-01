"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteAgent } from "@/hooks/use-agents";

type DeleteAgentTarget = {
  id: string;
  name: string;
} | null;

type DeleteAgentDialogProps = {
  agent: DeleteAgentTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectOnDelete?: boolean;
};

export function DeleteAgentDialog({
  agent,
  open,
  onOpenChange,
  redirectOnDelete = false,
}: DeleteAgentDialogProps) {
  const router = useRouter();
  const deleteAgent = useDeleteAgent();

  const handleDelete = async () => {
    if (!agent) {
      return;
    }

    await deleteAgent.mutateAsync(agent.id);
    onOpenChange(false);

    if (redirectOnDelete) {
      router.push("/agents");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete agent</DialogTitle>
          <DialogDescription>
            This permanently removes{" "}
            <span className="font-medium text-foreground">{agent?.name}</span>,
            including its knowledge, actions, channels, and conversation history.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteAgent.isPending}
          >
            {deleteAgent.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
