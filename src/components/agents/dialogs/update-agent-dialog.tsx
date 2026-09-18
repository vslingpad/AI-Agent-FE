"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useResetKey } from "@/hooks/use-reset-key";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateAgent } from "@/hooks/use-agents";
import type { AgentListItem } from "@/lib/schemas/agents";

const textareaClassName =
  "min-h-20 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type UpdateAgentDialogProps = {
  agent: AgentListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpdateAgentDialog({
  agent,
  open,
  onOpenChange,
}: UpdateAgentDialogProps) {
  const updateAgent = useUpdateAgent(agent?.id ?? "");
  const [name, setName] = useState(agent?.name ?? "");
  const [description, setDescription] = useState(agent?.description ?? "");

  if (useResetKey(open ? agent : null) && agent && open) {
    setName(agent.name);
    setDescription(agent.description);
  }

  const handleSubmit = async () => {
    const trimmed = name.trim();

    if (!agent || !trimmed) {
      return;
    }

    await updateAgent.mutateAsync({
      name: trimmed,
      description: description.trim(),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update agent</DialogTitle>
          <DialogDescription>
            Change the name and description shown on the agents list and in the
            workspace header.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="update-agent-name">Name</Label>
            <Input
              id="update-agent-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Customer Support"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-agent-description">Description</Label>
            <textarea
              id="update-agent-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this agent should handle"
              className={textareaClassName}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || updateAgent.isPending}
          >
            {updateAgent.isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
