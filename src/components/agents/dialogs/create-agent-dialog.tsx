"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAgent } from "@/hooks/use-agents";
import { agentPath } from "@/lib/navigation/agent-sections";

const textareaClassName =
  "min-h-20 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type CreateAgentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateAgentDialog({ open, onOpenChange }: CreateAgentDialogProps) {
  const router = useRouter();
  const createAgent = useCreateAgent();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setName("");
    setDescription("");
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    const agent = await createAgent.mutateAsync({
      name: trimmed,
      description: description.trim() || undefined,
    });

    reset();
    onOpenChange(false);
    router.push(agentPath(agent.id, "build/knowledge"));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create agent</DialogTitle>
          <DialogDescription>
            Start with knowledge, then test in the playground before you publish
            to a channel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Name</Label>
            <Input
              id="agent-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Customer Support"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <textarea
              id="agent-description"
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
            disabled={!name.trim() || createAgent.isPending}
          >
            {createAgent.isPending ? "Creating…" : "Create agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
