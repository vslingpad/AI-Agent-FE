"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, Trash2Icon } from "lucide-react";
import { AgentErrorState } from "@/components/agents/agent-states";
import { DeleteProcedureDialog } from "@/components/agents/build/procedures/delete-procedure-dialog";
import { ProcedureEditor } from "@/components/agents/build/procedures/procedure-editor";
import {
  ProcedureAnalyticsPanel,
  ProcedureExamplesPanel,
  ProcedureSimulationsPanel,
} from "@/components/agents/build/procedures/procedure-panels";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgentProcedures, useUpdateAgentProcedure } from "@/hooks/use-agents";

const PROCEDURE_TABS = [
  "details",
  "steps",
  "analytics",
  "examples",
  "simulations",
] as const;
type ProcedureTab = (typeof PROCEDURE_TABS)[number];

function parseTab(value: string | null): ProcedureTab {
  return PROCEDURE_TABS.includes(value as ProcedureTab)
    ? (value as ProcedureTab)
    : "details";
}

export function AgentProcedureDetailPage({
  agentId,
  procedureId,
}: {
  agentId: string;
  procedureId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const { data, isLoading, isError, refetch } = useAgentProcedures(agentId);
  const updateProcedure = useUpdateAgentProcedure(agentId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const proceduresPath = `/agents/${agentId}/build/procedures`;
  const procedure = useMemo(
    () => data?.procedures.find((item) => item.id === procedureId) ?? null,
    [data, procedureId]
  );

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "details") {
      params.delete("tab");
    } else {
      params.set("tab", next);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-80 w-full max-w-3xl rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <AgentErrorState
        message="Unable to load this procedure."
        onRetry={() => refetch()}
      />
    );
  }

  if (!procedure) {
    return (
      <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit"
          render={<Link href={proceduresPath} />}
        >
          <ChevronLeftIcon className="size-4" />
          Back to procedures
        </Button>
        <AgentErrorState
          message="This procedure could not be found."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="min-w-0 space-y-1">
            <Button
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit text-muted-foreground"
            render={<Link href={proceduresPath} />}
          >
            <ChevronLeftIcon className="size-4" />
            Back to procedures
          </Button>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {procedure.name}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {procedure.whenToUse}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <select
              className="h-9 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={procedure.status}
              aria-label="Procedure status"
              disabled={updateProcedure.isPending}
              onChange={(event) => {
                const next = event.target.value as "draft" | "live";
                updateProcedure.mutate({
                  procedureId: procedure.id,
                  input: {
                    status: next,
                    enabled: next === "live" ? procedure.enabled : false,
                  },
                });
              }}
            >
              <option value="draft">Draft</option>
              <option value="live">Live</option>
            </select>
            
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
              <Label htmlFor="procedure-header-enabled" className="text-sm">
                Enabled
              </Label>
              <Switch
                id="procedure-header-enabled"
                checked={procedure.enabled}
                disabled={procedure.status !== "live" || updateProcedure.isPending}
                title="Procedure must be live to be enabled"
                onCheckedChange={(checked) =>
                  updateProcedure.mutate({
                    procedureId: procedure.id,
                    input: { enabled: checked },
                  })
                }
              />
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2Icon className="size-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (typeof value === "string") {
            setTab(value);
          }
        }}
      >
        <TabsList className="grid w-full max-w-2xl grid-cols-3 sm:grid-cols-5">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="simulations">Simulations</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="max-w-3xl">
            <ProcedureEditor
              key={`${procedure.id}-details`}
              agentId={agentId}
              procedure={procedure}
              mode="details"
            />
          </div>
        </TabsContent>
        <TabsContent value="steps">
          <div className="max-w-3xl">
            <ProcedureEditor
              key={`${procedure.id}-steps`}
              agentId={agentId}
              procedure={procedure}
              mode="steps"
            />
          </div>
        </TabsContent>
        <TabsContent value="analytics">
          <ProcedureAnalyticsPanel agentId={agentId} procedureId={procedure.id} />
        </TabsContent>
        <TabsContent value="examples">
          <ProcedureExamplesPanel agentId={agentId} procedureId={procedure.id} />
        </TabsContent>
        <TabsContent value="simulations">
          <ProcedureSimulationsPanel agentId={agentId} procedureId={procedure.id} />
        </TabsContent>
      </Tabs>

      <DeleteProcedureDialog
        agentId={agentId}
        procedure={procedure}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => router.push(proceduresPath)}
      />
    </div>
  );
}
