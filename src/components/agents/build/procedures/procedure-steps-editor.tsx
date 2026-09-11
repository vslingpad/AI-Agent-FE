"use client";

import { ChevronDownIcon, ChevronUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createEmptyStep,
  stepSummary,
  validateProcedureSteps,
  type ProcedureStepValidation,
} from "@/lib/procedures/step-utils";
import type {
  ProcedureBody,
  ProcedureStep,
  ProcedureStepType,
  ProcedureToolOption,
} from "@/lib/schemas/procedures";

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const textareaClassName =
  "min-h-20 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const STEP_TYPE_LABELS: Record<ProcedureStepType, string> = {
  instruction: "Instruction",
  call_tool: "Call action",
  condition: "Branch",
  end: "End",
  wait_for_reply: "Wait for reply",
  handoff: "Handoff",
};

type ProcedureStepsEditorProps = {
  steps: ProcedureStep[];
  availableTools: ProcedureToolOption[];
  onChange: (steps: ProcedureStep[]) => void;
  validation?: ProcedureStepValidation;
  showErrors?: boolean;
};

export function ProcedureStepsEditor({
  steps,
  availableTools,
  onChange,
  validation,
  showErrors = true,
}: ProcedureStepsEditorProps) {
  const localValidation =
    validation ?? validateProcedureSteps(steps, availableTools);

  const addStep = (type: ProcedureStepType) => {
    onChange([...steps, createEmptyStep(type, steps)]);
  };

  const updateStep = (index: number, next: ProcedureStep) => {
    onChange(steps.map((step, i) => (i === index ? next : step)));
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) {
      return;
    }
    const next = [...steps];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  const stepIds = steps.map((step) => step.id);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium">Steps</h3>
          <p className="text-xs text-muted-foreground">
            Ordered SOP the agent follows after the procedure triggers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              "instruction",
              "call_tool",
              "condition",
              "wait_for_reply",
              "handoff",
              "end",
            ] as ProcedureStepType[]
          ).map((type) => (
            <Button
              key={type}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addStep(type)}
            >
              <PlusIcon />
              {STEP_TYPE_LABELS[type]}
            </Button>
          ))}
        </div>
      </div>

      {availableTools.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          Enable custom actions with &quot;Procedures&quot; turned on under Build →
          Actions before adding call-action steps.
        </p>
      ) : null}

      {steps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No steps yet. Add instructions, call actions, branches, and an end step.
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={`${step.id}-${index}`}
              className="rounded-lg border border-border bg-card p-4 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{STEP_TYPE_LABELS[step.type]}</Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      {step.id}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stepSummary(step)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Move step up"
                    disabled={index === 0}
                    onClick={() => moveStep(index, -1)}
                  >
                    <ChevronUpIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Move step down"
                    disabled={index === steps.length - 1}
                    onClick={() => moveStep(index, 1)}
                  >
                    <ChevronDownIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Remove step"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>

              <StepFields
                step={step}
                stepIds={stepIds}
                availableTools={availableTools}
                onChange={(next) => updateStep(index, next)}
              />
            </div>
          ))}
        </div>
      )}

      {showErrors && !localValidation.valid ? (
        <ul className="space-y-1 text-sm text-destructive" role="alert">
          {localValidation.errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function StepFields({
  step,
  stepIds,
  availableTools,
  onChange,
}: {
  step: ProcedureStep;
  stepIds: string[];
  availableTools: ProcedureToolOption[];
  onChange: (step: ProcedureStep) => void;
}) {
  if (step.type === "instruction") {
    return (
      <div className="space-y-2">
        <Label>Instruction text</Label>
        <textarea
          className={textareaClassName}
          value={step.text}
          onChange={(event) => onChange({ ...step, text: event.target.value })}
          placeholder="Ask for order number or email if not already known."
        />
      </div>
    );
  }

  if (step.type === "call_tool") {
    const argEntries = Object.entries(step.argMap);

    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Action</Label>
            <select
              className={selectClassName}
              value={step.toolSlug}
              onChange={(event) =>
                onChange({ ...step, toolSlug: event.target.value })
              }
            >
              <option value="">Select an action…</option>
              {availableTools.map((tool) => (
                <option key={tool.slug} value={tool.slug}>
                  {tool.name} ({tool.slug})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Save output as</Label>
            <Input
              value={step.outputAs}
              onChange={(event) =>
                onChange({ ...step, outputAs: event.target.value })
              }
              placeholder="order"
            />
            <p className="text-xs text-muted-foreground">
              Later steps can reference {"{{outputs."}
              {step.outputAs || "name"}
              {"}}"}.
            </p>
          </div>
        </div>

        <ArgMapEditor
          entries={argEntries}
          onChange={(argMap) => onChange({ ...step, argMap })}
        />
      </div>
    );
  }

  if (step.type === "condition") {
    return (
      <div className="space-y-3">
        {step.branches.map((branch, branchIndex) => (
          <div key={branchIndex} className="space-y-2 rounded-md border border-border p-3">
            <Label>
              {branch.else ? "Otherwise go to" : `If (${branchIndex + 1})`}
            </Label>
            {!branch.else ? (
              <Input
                value={branch.if ?? ""}
                onChange={(event) => {
                  const branches = step.branches.map((item, i) =>
                    i === branchIndex ? { ...item, if: event.target.value } : item
                  );
                  onChange({ ...step, branches });
                }}
                placeholder="outputs.order.found == false"
              />
            ) : null}
            <div className="flex flex-wrap gap-2">
              {stepIds
                .filter((id) => id !== step.id)
                .map((id) => {
                  const checked = branch.then.includes(id);
                  return (
                    <label
                      key={id}
                      className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          const then = event.target.checked
                            ? [...branch.then, id]
                            : branch.then.filter((value) => value !== id);
                          const branches = step.branches.map((item, i) =>
                            i === branchIndex ? { ...item, then } : item
                          );
                          onChange({ ...step, branches });
                        }}
                      />
                      {id}
                    </label>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (step.type === "wait_for_reply") {
    return (
      <div className="space-y-2">
        <Label>Prompt while waiting</Label>
        <Input
          value={step.message}
          onChange={(event) => onChange({ ...step, message: event.target.value })}
          placeholder="Reply yes to confirm, or no to cancel."
        />
      </div>
    );
  }

  if (step.type === "end") {
    return (
      <div className="space-y-2">
        <Label>Closing message</Label>
        <Input
          value={step.message}
          onChange={(event) => onChange({ ...step, message: event.target.value })}
          placeholder="Anything else I can help with?"
        />
      </div>
    );
  }

  if (step.type === "handoff") {
    return (
      <p className="text-sm text-muted-foreground">
        Transfers the conversation to a human agent. No extra fields.
      </p>
    );
  }

  return null;
}

function ArgMapEditor({
  entries,
  onChange,
}: {
  entries: [string, string][];
  onChange: (argMap: Record<string, string>) => void;
}) {
  const rows: [string, string][] = entries.length ? entries : [["", ""]];

  const updateRows = (nextRows: [string, string][]) => {
    const argMap: Record<string, string> = {};
    for (const [key, value] of nextRows) {
      const trimmedKey = key.trim();
      if (trimmedKey) {
        argMap[trimmedKey] = value;
      }
    }
    onChange(argMap);
  };

  return (
    <div className="space-y-2">
      <Label>Arguments</Label>
      <div className="space-y-2">
        {rows.map(([key, value], index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              value={key}
              placeholder="order_id"
              onChange={(event) => {
                const next: [string, string][] = rows.map((row, i) =>
                  i === index ? [event.target.value, row[1]] : row
                );
                updateRows(next);
              }}
            />
            <Input
              value={value}
              placeholder="{{slots.order_id}}"
              onChange={(event) => {
                const next: [string, string][] = rows.map((row, i) =>
                  i === index ? [row[0], event.target.value] : row
                );
                updateRows(next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Remove argument"
              onClick={() => updateRows(rows.filter((_, i) => i !== index))}
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => updateRows([...rows, ["", ""]])}
      >
        <PlusIcon />
        Add argument
      </Button>
    </div>
  );
}

export function procedureBodyFromSteps(steps: ProcedureStep[]): ProcedureBody {
  return { steps };
}
