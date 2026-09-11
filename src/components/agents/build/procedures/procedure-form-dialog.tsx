"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProcedureEditor } from "@/components/agents/build/procedures/procedure-editor";

export function ProcedureFormDialog({
  agentId,
  open,
  onOpenChange,
  initialTemplateId,
  onCreated,
}: {
  agentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTemplateId?: string | null;
  onCreated?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,900px)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add procedure</DialogTitle>
          <DialogDescription>
            Define when this agent should follow a multi-step SOP. Add instructions,
            call actions, branches, and an end step.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <ProcedureEditor
            key={initialTemplateId ?? "new"}
            agentId={agentId}
            initialTemplateId={initialTemplateId ?? ""}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => {
              onOpenChange(false);
              onCreated?.();
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
