"use client";

import { useState } from "react";
import { LoaderCircleIcon, PlayIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/hooks/use-agents";
import type { AgentProcedureBinding } from "@/lib/schemas/agents";

const chartConfig = {
  value: { label: "Runs", color: "var(--foreground)" },
} satisfies ChartConfig;

export function ProcedureDetailSheet({
  agentId,
  procedure,
  open,
  onOpenChange,
  onEdit,
}: {
  agentId: string;
  procedure: AgentProcedureBinding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}) {
  if (!procedure) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{procedure.name}</SheetTitle>
          <SheetDescription>{procedure.whenToUse}</SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={procedure.status === "live" ? "success" : "muted"}>
            {procedure.status === "live" ? "Live" : "Draft"}
          </Badge>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit steps
          </Button>
        </div>
        <Tabs defaultValue="analytics" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="simulations">Simulations</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics" className="mt-4">
            <ProcedureAnalyticsPanel agentId={agentId} procedureId={procedure.id} />
          </TabsContent>
          <TabsContent value="examples" className="mt-4">
            <ProcedureExamplesPanel agentId={agentId} procedureId={procedure.id} />
          </TabsContent>
          <TabsContent value="simulations" className="mt-4">
            <ProcedureSimulationsPanel agentId={agentId} procedureId={procedure.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function ProcedureAnalyticsPanel({
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
      <div className="grid grid-cols-2 gap-3">
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

function ProcedureExamplesPanel({
  agentId,
  procedureId,
}: {
  agentId: string;
  procedureId: string;
}) {
  const { data } = useProcedureExamples(agentId, procedureId);
  const createExample = useCreateProcedureExample(agentId, procedureId);
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
            size="sm"
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
      <ul className="space-y-2">
        {examples.map((example) => (
          <li
            key={example.id}
            className="flex items-start justify-between gap-2 rounded-md border border-border p-2 text-sm"
          >
            <div>
              <Badge variant="outline" className="mb-1">
                {example.kind}
              </Badge>
              <p>{example.text}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Delete example"
              onClick={() => deleteExample.mutate(example.id)}
            >
              <Trash2Icon />
            </Button>
          </li>
        ))}
        {examples.length === 0 ? (
          <li className="text-sm text-muted-foreground">No examples yet.</li>
        ) : null}
      </ul>
    </div>
  );
}

function ProcedureSimulationsPanel({
  agentId,
  procedureId,
}: {
  agentId: string;
  procedureId: string;
}) {
  const { data, refetch } = useProcedureSimulations(agentId, procedureId);
  const runSimulation = useRunProcedureSimulation(agentId, procedureId);
  const [openingMessage, setOpeningMessage] = useState(
    "Where is my order 8842?"
  );
  const [lastTrace, setLastTrace] = useState<Record<string, unknown> | null>(null);

  const simulations = data?.simulations ?? [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Run a mocked scenario — tool HTTP is stubbed; nothing is sent to customers.
      </p>
      <div className="space-y-2 rounded-lg border border-border p-3">
        <Label>Opening message</Label>
        <Input
          value={openingMessage}
          onChange={(event) => setOpeningMessage(event.target.value)}
        />
        <Button
          className="mt-2"
          disabled={!openingMessage.trim() || runSimulation.isPending}
          onClick={async () => {
            const result = await runSimulation.mutateAsync({
              scenario: {
                name: "Quick test",
                openingMessage,
                customerReplies: [],
                mockToolResponses: {
                  get_order_details: { found: true, order_id: "8842" },
                  get_order_status: { status: "shipped", tracking_url: "https://track.example/8842" },
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
      {lastTrace ? (
        <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 text-xs">
          {JSON.stringify(lastTrace, null, 2)}
        </pre>
      ) : null}
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
        {simulations.length === 0 ? (
          <li className="text-sm text-muted-foreground">No saved simulations yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
