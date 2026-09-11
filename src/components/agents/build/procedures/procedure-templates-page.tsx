"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutTemplateIcon } from "lucide-react";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentErrorState } from "@/components/agents/agent-states";
import { ProcedureFormDialog } from "@/components/agents/build/procedures/procedure-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProcedureTemplates } from "@/hooks/use-agents";

export function ProcedureTemplatesPage({ agentId }: { agentId: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useProcedureTemplates(agentId);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const openTemplateDialog = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setFormOpen(true);
  };

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
      description="Start from a platform SOP, review the steps in the dialog, then create the procedure."
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
            <CardContent>
              <div className="flex flex-wrap items-center gap-2">
                <LayoutTemplateIcon className="size-4 text-muted-foreground" />
                <p className="font-medium">{template.name}</p>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{template.description}</p>
              <p className="text-xs text-muted-foreground py-1">
                {template.stepCount} steps
                {template.typicalTools.length
                  ? ` · typical actions: ${template.typicalTools.join(", ")}`
                  : ""}
              </p>
              <Button size="sm" onClick={() => openTemplateDialog(template.id)}>
                Use template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProcedureFormDialog
        agentId={agentId}
        open={formOpen}
        initialTemplateId={selectedTemplateId}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setSelectedTemplateId(null);
          }
        }}
        onCreated={() => router.push(`/agents/${agentId}/build/procedures`)}
      />
    </AgentPageFrame>
  );
}
