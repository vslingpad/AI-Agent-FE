import { z } from "zod";

export const ProcedureStepTypeSchema = z.enum([
  "instruction",
  "call_tool",
  "condition",
  "end",
  "wait_for_reply",
]);

export const ProcedureArgMapSchema = z.record(z.string(), z.string());

export const ProcedureInstructionStepSchema = z.object({
  id: z.string(),
  type: z.literal("instruction"),
  text: z.string(),
});

export const ProcedureCallToolStepSchema = z.object({
  id: z.string(),
  type: z.literal("call_tool"),
  toolSlug: z.string(),
  argMap: ProcedureArgMapSchema.default({}),
  outputAs: z.string(),
});

export const ProcedureConditionBranchSchema = z.object({
  if: z.string().optional(),
  else: z.literal(true).optional(),
  then: z.array(z.string()).default([]),
});

export const ProcedureConditionStepSchema = z.object({
  id: z.string(),
  type: z.literal("condition"),
  mode: z.literal("jsonpath").default("jsonpath"),
  branches: z.array(ProcedureConditionBranchSchema).default([]),
});

export const ProcedureEndStepSchema = z.object({
  id: z.string(),
  type: z.literal("end"),
  message: z.string(),
  action: z.literal("none").default("none"),
});

export const ProcedureWaitForReplyStepSchema = z.object({
  id: z.string(),
  type: z.literal("wait_for_reply"),
  message: z.string(),
});

export const ProcedureStepSchema = z.discriminatedUnion("type", [
  ProcedureInstructionStepSchema,
  ProcedureCallToolStepSchema,
  ProcedureConditionStepSchema,
  ProcedureEndStepSchema,
  ProcedureWaitForReplyStepSchema,
]);

export const ProcedureBodySchema = z.object({
  steps: z.array(ProcedureStepSchema).default([]),
});

export const CreateAgentProcedureInputSchema = z.object({
  name: z.string().min(1).max(120),
  whenToUse: z.string().min(1).max(2000),
  status: z.enum(["draft", "live"]).default("draft"),
  enabled: z.boolean().default(false),
  body: ProcedureBodySchema.default({ steps: [] }),
});

export const UpdateAgentProcedureInputSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  whenToUse: z.string().min(1).max(2000).optional(),
  status: z.enum(["draft", "live"]).optional(),
  enabled: z.boolean().optional(),
  body: ProcedureBodySchema.optional(),
});

export type ProcedureStepType = z.infer<typeof ProcedureStepTypeSchema>;
export type ProcedureInstructionStep = z.infer<typeof ProcedureInstructionStepSchema>;
export type ProcedureCallToolStep = z.infer<typeof ProcedureCallToolStepSchema>;
export type ProcedureConditionStep = z.infer<typeof ProcedureConditionStepSchema>;
export type ProcedureEndStep = z.infer<typeof ProcedureEndStepSchema>;
export type ProcedureWaitForReplyStep = z.infer<typeof ProcedureWaitForReplyStepSchema>;
export type ProcedureStep = z.infer<typeof ProcedureStepSchema>;
export type ProcedureBody = z.infer<typeof ProcedureBodySchema>;
export type CreateAgentProcedureInput = z.infer<typeof CreateAgentProcedureInputSchema>;
export type UpdateAgentProcedureInput = z.infer<typeof UpdateAgentProcedureInputSchema>;

export const ProcedureTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  typicalTools: z.array(z.string()).default([]),
  whenToUse: z.string(),
  stepCount: z.number(),
});

export const ProcedureTemplatesListSchema = z.object({
  templates: z.array(ProcedureTemplateSchema),
});

export const ProcedureTriggerWarningSchema = z.object({
  procedureIds: z.array(z.string()),
  procedureNames: z.array(z.string()),
  score: z.number(),
  message: z.string(),
});

export const ProcedureTriggerWarningsListSchema = z.object({
  warnings: z.array(ProcedureTriggerWarningSchema).default([]),
});

export const ProcedureExampleSchema = z.object({
  id: z.string(),
  kind: z.enum(["include", "exclude"]),
  text: z.string(),
  createdAt: z.string().nullable().optional(),
});

export const ProcedureExamplesListSchema = z.object({
  examples: z.array(ProcedureExampleSchema),
});

export const ProcedureAnalyticsSchema = z.object({
  procedureId: z.string(),
  triggered: z.number(),
  pending: z.number(),
  resolved: z.number(),
  failed: z.number(),
  runsOverTime: z
    .array(
      z.object({
        date: z.string(),
        label: z.string(),
        value: z.number(),
      })
    )
    .default([]),
});

export const ProcedureSimulationRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  scenario: z.record(z.string(), z.unknown()).default({}),
  lastResult: z.enum(["pass", "fail"]).nullable().optional(),
  lastTrace: z.record(z.string(), z.unknown()).nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const ProcedureSimulationsListSchema = z.object({
  simulations: z.array(ProcedureSimulationRecordSchema),
});

export const RunProcedureSimulationInputSchema = z.object({
  scenario: z.record(z.string(), z.unknown()),
  save: z.boolean().default(true),
  simulationName: z.string().max(120).optional(),
});

export const RunProcedureSimulationResponseSchema = z.object({
  result: z.enum(["pass", "fail"]),
  trace: z.record(z.string(), z.unknown()),
  simulation: ProcedureSimulationRecordSchema.nullable().optional(),
});

export type ProcedureTemplate = z.infer<typeof ProcedureTemplateSchema>;
export type ProcedureTriggerWarning = z.infer<typeof ProcedureTriggerWarningSchema>;
export type ProcedureExample = z.infer<typeof ProcedureExampleSchema>;
export type ProcedureAnalytics = z.infer<typeof ProcedureAnalyticsSchema>;
export type ProcedureSimulationRecord = z.infer<typeof ProcedureSimulationRecordSchema>;
export type RunProcedureSimulationInput = z.infer<typeof RunProcedureSimulationInputSchema>;
export type RunProcedureSimulationResponse = z.infer<
  typeof RunProcedureSimulationResponseSchema
>;

export type ProcedureToolOption = {
  slug: string;
  name: string;
};
