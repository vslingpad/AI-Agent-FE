"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutTemplateIcon } from "lucide-react";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentErrorState } from "@/components/agents/agent-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCreateProcedureFromTemplate,
  useProcedureTemplates,
} from "@/hooks/use-agents";

export function ProcedureTemplatesPage({ agentId }: { agentId: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useProcedureTemplates(agentId);
  const createFromTemplate = useCreateProcedureFromTemplate(agentId);

  if (isLoading) {
    return (
      <AgentPageFrame title="Procedure templates" description="Loading templates…">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AgentPageFrame>
    );
  }

  if (isError || !data) {
    return (
      <AgentErrorState
        message="Unable to load procedure templates."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <AgentPageFrame
      title="Procedure templates"
      description="Platform SOPs you can clone as drafts on this agent, then bind actions and set live."
      actions={
        <Button
          variant="outline"
          render={<Link href={`/agents/${agentId}/build/procedures`} />}
        >
          Back to procedures
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 max-w-5xl">
        {data.templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="space-y-3 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <LayoutTemplateIcon className="size-4 text-muted-foreground" />
                <p className="font-medium">{template.name}</p>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{template.description}</p>
              <p className="text-xs text-muted-foreground">
                {template.stepCount} steps
                {template.typicalTools.length
                  ? ` · typical actions: ${template.typicalTools.join(", ")}`
                  : ""}
              </p>
              <Button
                size="sm"
                disabled={createFromTemplate.isPending}
                onClick={() =>
                  createFromTemplate.mutate(template.id, {
                    onSuccess: () => {
                      router.push(`/agents/${agentId}/build/procedures`);
                    },
                  })
                }
              >
                Use template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AgentPageFrame>
  );
}
