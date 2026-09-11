"use client";

import { useState } from "react";
import { LoaderCircleIcon, PlayIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  useCreateProcedureExample,
  useDeleteProcedureExample,
  useProcedureAnalytics,
  useProcedureExamples,
  useProcedureSimulations,
  useRunProcedureSimulation,
  useUpdateProcedureExample,
} from "@/hooks/use-agents";

const chartConfig = {
  value: { label: "Runs", color: "var(--foreground)" },
} satisfies ChartConfig;

export function ProcedureAnalyticsPanel({
  agentId,
  procedureId,
}: {
  agentId: string;
  procedureId: string;
}) {
  const { data, isLoading, isError } = useProcedureAnalytics(agentId, procedureId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading analytics…</p>;
  }
  if (isError || !data) {
    return <p className="text-sm text-destructive">Unable to load analytics.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Triggered" value={data.triggered} />
        <MetricCard label="Pending" value={data.pending} />
        <MetricCard label="Resolved" value={data.resolved} />
        <MetricCard label="Failed" value={data.failed} />
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="mb-3 text-sm font-medium">Runs (14 days)</p>
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <LineChart data={data.runsOverTime} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function ProcedureExamplesPanel({
  agentId,
  procedureId,
}: {
  agentId: string;
  procedureId: string;
}) {
  const { data } = useProcedureExamples(agentId, procedureId);
  const createExample = useCreateProcedureExample(agentId, procedureId);
  const updateExample = useUpdateProcedureExample(agentId, procedureId);
  const deleteExample = useDeleteProcedureExample(agentId, procedureId);
  const [kind, setKind] = useState<"include" | "exclude">("include");
  const [text, setText] = useState("");

  const examples = data?.examples ?? [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Include examples help trigger this procedure; exclude examples prevent false
        positives.
      </p>
      <div className="space-y-2 rounded-lg border border-border p-3">
        <div className="grid gap-2 sm:grid-cols-[120px_1fr_auto]">
          <select
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
            value={kind}
            onChange={(event) => setKind(event.target.value as "include" | "exclude")}
          >
            <option value="include">Include</option>
            <option value="exclude">Exclude</option>
          </select>
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Example customer message"
          />
          <Button
            disabled={!text.trim() || createExample.isPending}
            onClick={async () => {
              await createExample.mutateAsync({ kind, text: text.trim() });
              setText("");
            }}
          >
            <PlusIcon />
            Add
          </Button>
        </div>
      </div>
      {examples.length > 0 ? (
        <Card className="overflow-hidden py-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-140 text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Example</th>
                  <th className="w-36 px-5 py-3 font-medium">Kind</th>
                  <th className="w-16 px-5 py-3 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {examples.map((example) => (
                  <tr
                    key={example.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-5 py-3 align-middle">{example.text}</td>
                    <td className="px-5 py-3 align-middle">
                      <select
                        className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                        value={example.kind}
                        aria-label={`Kind for ${example.text}`}
                        disabled={updateExample.isPending}
                        onChange={(event) =>
                          updateExample.mutate({
                            exampleId: example.id,
                            input: {
                              kind: event.target.value as "include" | "exclude",
                            },
                          })
                        }
                      >
                        <option value="include">Include</option>
                        <option value="exclude">Exclude</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 align-middle">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Delete example"
                          onClick={() => deleteExample.mutate(example.id)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

export function ProcedureSimulationsPanel({
  agentId,
  procedureId,
}: {
  agentId: string;
  procedureId: string;
}) {
  const { data, refetch } = useProcedureSimulations(agentId, procedureId);
  const runSimulation = useRunProcedureSimulation(agentId, procedureId);
  const [openingMessage, setOpeningMessage] = useState("Where is my order 8842?");
  const [lastTrace, setLastTrace] = useState<Record<string, unknown> | null>(null);

  const simulations = data?.simulations ?? [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Run a mocked scenario — tool HTTP is stubbed; nothing is sent to customers.
      </p>
      <div className="space-y-2 rounded-lg border border-border p-3">
        <Label className="pl-0.5">Opening message</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            className="flex-1"
            value={openingMessage}
            onChange={(event) => setOpeningMessage(event.target.value)}
          />
          <Button
            className="shrink-0"
            disabled={!openingMessage.trim() || runSimulation.isPending}
            onClick={async () => {
              const result = await runSimulation.mutateAsync({
                scenario: {
                  name: "Quick test",
                  openingMessage,
                  customerReplies: [],
                  mockToolResponses: {
                    get_order_details: { found: true, order_id: "8842" },
                    get_order_status: {
                      status: "shipped",
                      tracking_url: "https://track.example/8842",
                    },
                    order_lookup: { found: true, status: "shipped" },
                  },
                  successCriteria: { minSteps: 1 },
                },
                save: true,
                simulationName: "Quick test",
              });
              setLastTrace(result.trace);
              await refetch();
            }}
          >
            {runSimulation.isPending ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <PlayIcon />
            )}
            Run simulation
          </Button>
        </div>
      </div>
      {lastTrace ? (
        <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 text-xs">
          {JSON.stringify(lastTrace, null, 2)}
        </pre>
      ) : null}
      {simulations.length > 0 ? (
        <ul className="space-y-2">
          {simulations.map((sim) => (
            <li key={sim.id} className="rounded-md border border-border p-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{sim.name}</span>
                {sim.lastResult ? (
                  <Badge variant={sim.lastResult === "pass" ? "success" : "destructive"}>
                    {sim.lastResult}
                  </Badge>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
