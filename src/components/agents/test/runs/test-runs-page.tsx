"use client";

import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentErrorState, AgentTestRunsSkeleton } from "@/components/agents/agent-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAgentTestCases, useAgentTestRuns } from "@/hooks/use-agents";
import { formatLastSyncAttempt } from "@/lib/integrations/connector-paths";

export function AgentTestRunsPage({ agentId }: { agentId: string }) {
  const { data: testCases } = useAgentTestCases(agentId);
  const { data, isLoading, isError, refetch } = useAgentTestRuns(agentId);

  if (isLoading) {
    return <AgentTestRunsSkeleton />;
  }

  if (isError || !data) {
    return (
      <AgentErrorState message="Unable to load test runs." onRetry={() => refetch()} />
    );
  }

  return (
    <AgentPageFrame
      title="Test Runs"
      description="Batch simulations against saved cases. Procedures can be simulated here before go-live."
      actions={
        <Button disabled={(testCases?.testCases.length ?? 0) === 0}>Run all cases</Button>
      }
    >
      {data.testRuns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm font-medium">No runs yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add test cases, then run the suite before you publish.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.testRuns.map((run) => (
            <Card key={run.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{run.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {run.caseCount} cases · {formatLastSyncAttempt(run.startedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      run.status === "passed"
                        ? "success"
                        : run.status === "failed"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {run.status}
                  </Badge>
                  <span className="text-sm tabular-nums">{run.passRate}% pass</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AgentPageFrame>
  );
}
