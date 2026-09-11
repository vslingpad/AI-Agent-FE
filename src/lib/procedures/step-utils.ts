import {
  ProcedureBodySchema,
  type ProcedureBody,
  type ProcedureCallToolStep,
  type ProcedureConditionStep,
  type ProcedureEndStep,
  type ProcedureHandoffStep,
  type ProcedureInstructionStep,
  type ProcedureStep,
  type ProcedureStepType,
  type ProcedureToolOption,
} from "@/lib/schemas/procedures";

const MAX_INSTRUCTION_STEPS = 15;

function toCamelKey(key: string) {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function toSnakeKey(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function mapKeys(value: unknown, mapKey: (key: string) => string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => mapKeys(item, mapKey));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out[mapKey(key)] = mapKeys(nested, mapKey);
    }
    return out;
  }
  return value;
}

function normalizeConditionBranch(branch: Record<string, unknown>): Record<string, unknown> {
  const elseValue = branch.else;
  if (Array.isArray(elseValue)) {
    return { else: true, then: elseValue };
  }
  if (elseValue === true || elseValue === "else") {
    return { else: true, then: Array.isArray(branch.then) ? branch.then : [] };
  }
  return {
    if: typeof branch.if === "string" ? branch.if : "",
    then: Array.isArray(branch.then) ? branch.then : [],
  };
}

function normalizeProcedureSteps(rawSteps: unknown): unknown {
  if (!Array.isArray(rawSteps)) {
    return [];
  }
  return rawSteps.map((step) => {
    if (!step || typeof step !== "object") {
      return step;
    }
    const record = step as Record<string, unknown>;
    if (record.type !== "condition" || !Array.isArray(record.branches)) {
      return step;
    }
    return {
      ...record,
      branches: record.branches.map((branch) =>
        branch && typeof branch === "object"
          ? normalizeConditionBranch(branch as Record<string, unknown>)
          : branch
      ),
    };
  });
}

function denormalizeConditionBranch(branch: Record<string, unknown>): Record<string, unknown> {
  if (branch.else === true) {
    const thenSteps = Array.isArray(branch.then) ? branch.then : [];
    return { else: thenSteps };
  }
  const payload: Record<string, unknown> = {
    then: Array.isArray(branch.then) ? branch.then : [],
  };
  if (typeof branch.if === "string" && branch.if.trim()) {
    payload.if = branch.if;
  }
  return payload;
}

function denormalizeProcedureSteps(steps: ProcedureStep[]): unknown[] {
  return steps.map((step) => {
    if (step.type !== "condition") {
      return step;
    }
    return {
      ...step,
      branches: step.branches.map((branch) =>
        denormalizeConditionBranch(branch as unknown as Record<string, unknown>)
      ),
    };
  });
}

export function parseProcedureBody(raw: unknown): ProcedureBody {
  const mapped = mapKeys(raw ?? { steps: [] }, toCamelKey) as { steps?: unknown };
  const normalized = {
    ...mapped,
    steps: normalizeProcedureSteps(mapped.steps),
  };
  return ProcedureBodySchema.parse(normalized);
}

export function serializeProcedureBody(body: ProcedureBody): { steps: unknown[] } {
  const steps = denormalizeProcedureSteps(body.steps);
  return mapKeys({ steps }, toSnakeKey) as { steps: unknown[] };
}

export function generateStepId(existing: ProcedureStep[]): string {
  const used = new Set(existing.map((step) => step.id));
  let index = existing.length + 1;
  while (used.has(`s${index}`)) {
    index += 1;
  }
  return `s${index}`;
}

export function createEmptyStep(
  type: ProcedureStepType,
  existing: ProcedureStep[]
): ProcedureStep {
  const id = generateStepId(existing);

  switch (type) {
    case "instruction":
      return { id, type, text: "" };
    case "call_tool":
      return { id, type, toolSlug: "", argMap: {}, outputAs: "" };
    case "condition":
      return {
        id,
        type,
        mode: "jsonpath",
        branches: [{ if: "", then: [] }, { else: true, then: [] }],
      };
    case "end":
      return { id, type, message: "Anything else I can help with?", action: "none" };
    case "wait_for_reply":
      return { id, type, message: "Please reply to continue." };
    case "handoff":
      return { id, type };
  }
}

export function countInstructionSteps(steps: ProcedureStep[]): number {
  return steps.filter((step) => step.type === "instruction").length;
}

export function collectToolSlugs(steps: ProcedureStep[]): string[] {
  return steps
    .filter((step): step is ProcedureCallToolStep => step.type === "call_tool")
    .map((step) => step.toolSlug.trim())
    .filter(Boolean);
}

export type ProcedureStepValidation = {
  valid: boolean;
  errors: string[];
};

export function validateProcedureSteps(
  steps: ProcedureStep[],
  availableTools: ProcedureToolOption[]
): ProcedureStepValidation {
  const errors: string[] = [];
  const allowedSlugs = new Set(availableTools.map((tool) => tool.slug));
  const ids = new Set<string>();

  if (countInstructionSteps(steps) > MAX_INSTRUCTION_STEPS) {
    errors.push(`Procedures may have at most ${MAX_INSTRUCTION_STEPS} instruction steps.`);
  }

  for (const step of steps) {
    if (!step.id.trim()) {
      errors.push("Every step needs an id.");
      continue;
    }
    if (ids.has(step.id)) {
      errors.push(`Duplicate step id: ${step.id}`);
    }
    ids.add(step.id);

    if (step.type === "instruction" && !step.text.trim()) {
      errors.push(`Instruction step ${step.id} needs text.`);
    }

    if (step.type === "call_tool") {
      if (!step.toolSlug.trim()) {
        errors.push(`Call action step ${step.id} needs an action.`);
      } else if (!allowedSlugs.has(step.toolSlug)) {
        errors.push(
          `Step ${step.id} references "${step.toolSlug}" — enable that action for procedures on this agent.`
        );
      }
      if (!step.outputAs.trim()) {
        errors.push(`Call action step ${step.id} needs an output name.`);
      }
    }

    if (step.type === "condition") {
      if (!step.branches.length) {
        errors.push(`Condition step ${step.id} needs at least one branch.`);
      }
      if (step.branches.length > 5) {
        errors.push(`Condition step ${step.id} may have at most 5 branches.`);
      }
    }

    if (step.type === "end" && !step.message.trim()) {
      errors.push(`End step ${step.id} needs a message.`);
    }

    if (step.type === "wait_for_reply" && !step.message.trim()) {
      errors.push(`Wait step ${step.id} needs a prompt message.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function stepSummary(step: ProcedureStep): string {
  switch (step.type) {
    case "instruction":
      return step.text.trim() || "Instruction";
    case "call_tool":
      return step.toolSlug
        ? `Call ${step.toolSlug} → outputs.${step.outputAs || "?"}`
        : "Call action";
    case "condition":
      return `Branch (${step.branches.length} paths)`;
    case "end":
      return step.message.trim() || "End";
    case "wait_for_reply":
      return step.message.trim() || "Wait for reply";
    case "handoff":
      return "Transfer to a human agent";
  }
}

export function isInstructionStep(step: ProcedureStep): step is ProcedureInstructionStep {
  return step.type === "instruction";
}

export function isCallToolStep(step: ProcedureStep): step is ProcedureCallToolStep {
  return step.type === "call_tool";
}

export function isConditionStep(step: ProcedureStep): step is ProcedureConditionStep {
  return step.type === "condition";
}

export function isEndStep(step: ProcedureStep): step is ProcedureEndStep {
  return step.type === "end";
}

export function isHandoffStep(step: ProcedureStep): step is ProcedureHandoffStep {
  return step.type === "handoff";
}

export const ORDER_STATUS_TEMPLATE: ProcedureBody = {
  steps: [
    {
      id: "s1",
      type: "instruction",
      text: "Ask for order number or email if not already known.",
    },
    {
      id: "s2",
      type: "call_tool",
      toolSlug: "get_order_details",
      argMap: {
        order_id: "{{slots.order_id}}",
        email: "{{slots.email}}",
      },
      outputAs: "order",
    },
    {
      id: "s3",
      type: "condition",
      mode: "jsonpath",
      branches: [
        { if: "outputs.order.found == false", then: ["s3a", "s3b"] },
        { else: true, then: ["s4"] },
      ],
    },
    {
      id: "s3a",
      type: "instruction",
      text: "Tell the customer the order was not found. Ask them to re-check the number.",
    },
    {
      id: "s3b",
      type: "end",
      message: "Anything else I can help with?",
      action: "none",
    },
    {
      id: "s4",
      type: "call_tool",
      toolSlug: "get_order_status",
      argMap: {
        order_id: "{{outputs.order.order_id}}",
        order_tracking_id: "{{outputs.order.order_tracking_id}}",
      },
      outputAs: "status",
    },
    {
      id: "s5",
      type: "instruction",
      text: "Explain status, carrier, and tracking URL from the last tool result. Do not invent tracking numbers.",
    },
    {
      id: "s6",
      type: "end",
      message: "Anything else I can help with?",
      action: "none",
    },
  ],
};
