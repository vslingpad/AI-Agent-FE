"use client";

import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentErrorState, AgentTestCasesSkeleton } from "@/components/agents/agent-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAgentTestCases } from "@/hooks/use-agents";
import { formatLastSyncAttempt } from "@/lib/integrations/connector-paths";

export function AgentTestCasesPage({ agentId }: { agentId: string }) {
  const { data, isLoading, isError, refetch } = useAgentTestCases(agentId);

  if (isLoading) {
    return <AgentTestCasesSkeleton />;
  }

  if (isError || !data) {
    return (
      <AgentErrorState message="Unable to load test cases." onRetry={() => refetch()} />
    );
  }

  return (
    <AgentPageFrame
      title="Test Cases"
      description="Saved prompts with expected answers. Run them as a suite from Test Runs."
      actions={
        <Button variant="outline" disabled>
          New case
        </Button>
      }
    >
      {data.testCases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm font-medium">No test cases yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Capture playground prompts you care about so regressions are obvious
            before publish.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.testCases.map((testCase) => (
            <Card key={testCase.id}>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{testCase.name}</p>
                  <Badge
                    variant={
                      testCase.lastResult === "pass"
                        ? "success"
                        : testCase.lastResult === "fail"
                          ? "destructive"
                          : "muted"
                    }
                  >
                    {testCase.lastResult === "none" ? "Not run" : testCase.lastResult}
                  </Badge>
                  {testCase.lastRunAt ? (
                    <span className="text-xs text-muted-foreground">
                      {formatLastSyncAttempt(testCase.lastRunAt)}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">Prompt: {testCase.prompt}</p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Expects: </span>
                  {testCase.expectedContains}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AgentPageFrame>
  );
}
