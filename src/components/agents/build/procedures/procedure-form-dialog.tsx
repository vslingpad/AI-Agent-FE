"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  ProcedureStepsEditor,
  procedureBodyFromSteps,
} from "@/components/agents/build/procedures/procedure-steps-editor";
import {
  useCreateAgentProcedure,
  useUpdateAgentProcedure,
} from "@/hooks/use-agents";
import { useAgentProcedureTools } from "@/hooks/use-procedure-tools";
import {
  ORDER_STATUS_TEMPLATE,
  parseProcedureBody,
  validateProcedureSteps,
} from "@/lib/procedures/step-utils";
import type { AgentProcedureBinding } from "@/lib/schemas/agents";
import type { ProcedureStep } from "@/lib/schemas/procedures";

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const textareaClassName =
  "min-h-24 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type ProcedureFormDialogProps = {
  agentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedure?: AgentProcedureBinding | null;
};

export function ProcedureFormDialog({
  agentId,
  open,
  onOpenChange,
  procedure = null,
}: ProcedureFormDialogProps) {
  const isEditing = Boolean(procedure);
  const createProcedure = useCreateAgentProcedure(agentId);
  const updateProcedure = useUpdateAgentProcedure(agentId);
  const availableTools = useAgentProcedureTools(agentId);

  const [name, setName] = useState("");
  const [whenToUse, setWhenToUse] = useState("");
  const [status, setStatus] = useState<"draft" | "live">("draft");
  const [enabled, setEnabled] = useState(false);
  const [steps, setSteps] = useState<ProcedureStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (procedure) {
      setName(procedure.name);
      setWhenToUse(procedure.whenToUse);
      setStatus(procedure.status);
      setEnabled(procedure.enabled);
      setSteps(parseProcedureBody(procedure.body).steps);
    } else {
      setName("");
      setWhenToUse("");
      setStatus("draft");
      setEnabled(false);
      setSteps([]);
    }
    setError(null);
  }, [open, procedure]);

  const stepValidation = useMemo(
    () => validateProcedureSteps(steps, availableTools),
    [steps, availableTools]
  );

  const basicsValid = name.trim().length > 0 && whenToUse.trim().length > 0;
  const requiresToolValidation = status === "live";
  const stepsValid = requiresToolValidation ? stepValidation.valid : true;
  const valid = basicsValid && stepsValid;
  const isPending = createProcedure.isPending || updateProcedure.isPending;

  const handleSubmit = async () => {
    if (!valid) {
      return;
    }

    setError(null);
    const body = procedureBodyFromSteps(steps);

    try {
      if (procedure) {
        await updateProcedure.mutateAsync({
          procedureId: procedure.id,
          input: {
            name: name.trim(),
            whenToUse: whenToUse.trim(),
            status,
            enabled: status === "live" ? enabled : false,
            body,
          },
        });
      } else {
        await createProcedure.mutateAsync({
          name: name.trim(),
          whenToUse: whenToUse.trim(),
          status,
          enabled: status === "live" ? enabled : false,
          body,
        });
      }
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : `Failed to ${isEditing ? "update" : "create"} procedure`
      );
    }
  };

  const loadOrderStatusTemplate = () => {
    setName((current) => current || "Order status");
    setWhenToUse(
      (current) =>
        current ||
        "Customer provides an order ID or email and wants tracking or ETA."
    );
    setSteps(ORDER_STATUS_TEMPLATE.steps);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,900px)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit procedure" : "Add procedure"}</DialogTitle>
          <DialogDescription>
            Define when this agent should follow a multi-step SOP. Add instructions,
            call actions, branches, and an end step.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <section className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium">Basics</h3>
              {!isEditing ? (
                <Button type="button" variant="outline" size="sm" onClick={loadOrderStatusTemplate}>
                  Load order status example
                </Button>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedure-name">Name</Label>
              <Input
                id="procedure-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Order status"
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedure-when">When to use</Label>
              <textarea
                id="procedure-when"
                className={textareaClassName}
                value={whenToUse}
                onChange={(event) => setWhenToUse(event.target.value)}
                placeholder="Customer provides an order ID or email and wants tracking or ETA."
                maxLength={2000}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="procedure-status">Status</Label>
                <select
                  id="procedure-status"
                  className={selectClassName}
                  value={status}
                  onChange={(event) => {
                    const next = event.target.value as "draft" | "live";
                    setStatus(next);
                    if (next === "draft") {
                      setEnabled(false);
                    }
                  }}
                >
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                </select>
              </div>

              {status === "live" ? (
                <div className="flex items-end">
                  <div className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2.5">
                    <Label htmlFor="procedure-enabled">Enabled</Label>
                    <Switch
                      id="procedure-enabled"
                      checked={enabled}
                      onCheckedChange={setEnabled}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <ProcedureStepsEditor
            steps={steps}
            availableTools={availableTools}
            onChange={setSteps}
            validation={stepValidation}
          />

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!valid || isPending}>
            {isPending
              ? isEditing
                ? "Saving…"
                : "Creating…"
              : isEditing
                ? "Save procedure"
                : "Create procedure"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
