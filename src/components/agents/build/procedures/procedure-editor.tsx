"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ProcedureStepsEditor,
  procedureBodyFromSteps,
} from "@/components/agents/build/procedures/procedure-steps-editor";
import {
  useCreateAgentProcedure,
  useProcedureTemplates,
  useUpdateAgentProcedure,
} from "@/hooks/use-agents";
import { useAgentProcedureTools } from "@/hooks/use-procedure-tools";
import { parseProcedureBody, validateProcedureSteps } from "@/lib/procedures/step-utils";
import type { AgentProcedureBinding } from "@/lib/schemas/agents";
import type { ProcedureStep } from "@/lib/schemas/procedures";

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const textareaClassName =
  "min-h-24 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ProcedureEditor({
  agentId,
  procedure = null,
  mode = "all",
  initialTemplateId = "",
  onCancel,
  onSuccess,
}: {
  agentId: string;
  procedure?: AgentProcedureBinding | null;
  mode?: "all" | "details" | "steps";
  initialTemplateId?: string;
  onCancel?: () => void;
  onSuccess?: (saved: AgentProcedureBinding) => void;
}) {
  const isEditing = Boolean(procedure);
  const showDetails = mode === "all" || mode === "details";
  const showSteps = mode === "all" || mode === "steps";
  const createProcedure = useCreateAgentProcedure(agentId);
  const updateProcedure = useUpdateAgentProcedure(agentId);
  const availableTools = useAgentProcedureTools(agentId);
  const { data: templatesData } = useProcedureTemplates(
    agentId,
    mode === "all" && !isEditing
  );
  const templates = templatesData?.templates ?? [];

  const [name, setName] = useState(procedure?.name ?? "");
  const [whenToUse, setWhenToUse] = useState(procedure?.whenToUse ?? "");
  const [status, setStatus] = useState<"draft" | "live">(procedure?.status ?? "draft");
  const [enabled, setEnabled] = useState(procedure?.enabled ?? false);
  const [steps, setSteps] = useState<ProcedureStep[]>(() =>
    procedure ? parseProcedureBody(procedure.body).steps : []
  );
  const [error, setError] = useState<string | null>(null);
  const [showStepErrors, setShowStepErrors] = useState(mode === "all");
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId);
  const appliedInitialTemplate = useRef<string | null>(null);

  const stepValidation = useMemo(
    () => validateProcedureSteps(steps, availableTools),
    [steps, availableTools]
  );

  const editorStatus = isEditing ? (procedure?.status ?? "draft") : status;
  const editorEnabled = isEditing ? (procedure?.enabled ?? false) : enabled;
  const basicsValid = name.trim().length > 0 && whenToUse.trim().length > 0;
  const isPending = createProcedure.isPending || updateProcedure.isPending;

  const handleSubmit = async () => {
    if (showDetails && !basicsValid) {
      setError("Name and when to use are required.");
      return;
    }

    if (showSteps && !stepValidation.valid) {
      setShowStepErrors(true);
      setError(
        stepValidation.errors[0] ??
          (isEditing
            ? "Fix the step errors before saving."
            : "Fix the step errors before creating this procedure.")
      );
      return;
    }

    setError(null);
    const body = procedureBodyFromSteps(steps);

    try {
      const saved = procedure
        ? await updateProcedure.mutateAsync({
            procedureId: procedure.id,
            input:
              mode === "details"
                ? {
                    name: name.trim(),
                    whenToUse: whenToUse.trim(),
                  }
                : mode === "steps"
                  ? { body }
                  : {
                      name: name.trim(),
                      whenToUse: whenToUse.trim(),
                      body,
                    },
          })
        : await createProcedure.mutateAsync({
            name: name.trim(),
            whenToUse: whenToUse.trim(),
            status: editorStatus,
            enabled: editorStatus === "live" ? editorEnabled : false,
            body,
          });
      onSuccess?.(saved);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : `Failed to ${isEditing ? "update" : "create"} procedure`
      );
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }

    try {
      setSelectedTemplateId(template.id);
      setName(template.name);
      setWhenToUse(template.whenToUse);
      setSteps(parseProcedureBody(template.body).steps);
      setError(null);
      setShowStepErrors(false);
    } catch (applyError) {
      setError(
        applyError instanceof Error ? applyError.message : "Failed to apply template"
      );
    }
  };

  useEffect(() => {
    if (isEditing || !initialTemplateId) {
      return;
    }
    if (appliedInitialTemplate.current === initialTemplateId) {
      return;
    }
    const template = templatesData?.templates.find(
      (item) => item.id === initialTemplateId
    );
    if (!template) {
      return;
    }

    appliedInitialTemplate.current = initialTemplateId;
    try {
      setSelectedTemplateId(template.id);
      setName(template.name);
      setWhenToUse(template.whenToUse);
      setSteps(parseProcedureBody(template.body).steps);
      setError(null);
      setShowStepErrors(false);
    } catch (applyError) {
      setError(
        applyError instanceof Error ? applyError.message : "Failed to apply template"
      );
    }
  }, [initialTemplateId, isEditing, templatesData]);

  return (
    <div className="grid gap-6">
      {!isEditing ? (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="space-y-2 lg:w-36">
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

              <div className="flex items-end">
                <div className="flex h-9 items-center gap-2 rounded-lg border border-border px-3">
                  <Label htmlFor="procedure-enabled">Enabled</Label>
                  <Switch
                    id="procedure-enabled"
                    checked={enabled}
                    disabled={status !== "live"}
                    title="Procedure must be live to be enabled"
                    onCheckedChange={setEnabled}
                  />
                </div>
              </div>

              {mode === "all" ? (
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label htmlFor="procedure-template">Load template</Label>
                    <select
                      id="procedure-template"
                      className={selectClassName}
                      value={selectedTemplateId}
                      onChange={(event) => setSelectedTemplateId(event.target.value)}
                    >
                      <option value="">Select a template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                          {template.stepCount ? ` · ${template.stepCount} steps` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!selectedTemplateId}
                    onClick={() => applyTemplate(selectedTemplateId)}
                  >
                    Apply
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null
      }
      {showDetails ? (
        <section className="grid gap-4">
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
        </section>
      ) : null}

      {showSteps ? (
        <ProcedureStepsEditor
          steps={steps}
          availableTools={availableTools}
          onChange={setSteps}
          validation={stepValidation}
          showErrors={showStepErrors}
        />
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button onClick={() => void handleSubmit()} disabled={isPending}>
          {isPending
            ? isEditing
              ? "Saving…"
              : "Creating…"
            : isEditing
              ? "Save procedure"
              : "Create procedure"}
        </Button>
      </div>
    </div>
  );
}
