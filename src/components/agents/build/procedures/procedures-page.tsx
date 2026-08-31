"use client";

import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentErrorState, AgentProceduresSkeleton } from "@/components/agents/agent-states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAgentProcedures, useUpdateAgentProcedures } from "@/hooks/use-agents";
import { formatLastSyncAttempt } from "@/lib/integrations/connector-paths";

export function AgentProceduresPage({ agentId }: { agentId: string }) {
  const { data, isLoading, isError, refetch } = useAgentProcedures(agentId);
  const updateProcedures = useUpdateAgentProcedures(agentId);

  if (isLoading) {
    return <AgentProceduresSkeleton />;
  }

  if (isError || !data) {
    return (
      <AgentErrorState
        message="Unable to load procedures."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <AgentPageFrame
      title="Procedures"
      description="Multi-step SOPs this agent follows for a matched intent. Procedures call actions; they do not replace them."
    >
      <div className="space-y-3">
        {data.procedures.map((procedure) => (
          <Card key={procedure.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{procedure.name}</p>
                  <Badge variant={procedure.status === "live" ? "success" : "muted"}>
                    {procedure.status === "live" ? "Live" : "Draft"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{procedure.whenToUse}</p>
                <p className="text-xs text-muted-foreground">
                  {procedure.stepCount} steps
                  {procedure.lastSimulatedAt
                    ? ` · last simulation ${formatLastSyncAttempt(procedure.lastSimulatedAt)}`
                    : " · not simulated yet"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`proc-${procedure.id}`} className="text-sm">
                  Enable
                </Label>
                <Switch
                  id={`proc-${procedure.id}`}
                  checked={procedure.enabled}
                  disabled={
                    procedure.status !== "live" || updateProcedures.isPending
                  }
                  onCheckedChange={(checked) =>
                    updateProcedures.mutate({
                      procedureId: procedure.id,
                      procedureEnabled: checked,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AgentPageFrame>
  );
}
