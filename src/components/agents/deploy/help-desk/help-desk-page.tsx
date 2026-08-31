"use client";

import Link from "next/link";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentErrorState, AgentHelpDeskSkeleton } from "@/components/agents/agent-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAgentHelpDesk, useUpdateAgentHelpDesk } from "@/hooks/use-agents";
import { getConnectorPath } from "@/lib/integrations/connector-paths";

export function AgentHelpDeskPage({ agentId }: { agentId: string }) {
  const { data: desk, isLoading, isError, refetch } = useAgentHelpDesk(agentId);
  const updateHelpDesk = useUpdateAgentHelpDesk(agentId);

  if (isLoading) {
    return <AgentHelpDeskSkeleton />;
  }

  if (isError || !desk) {
    return (
      <AgentErrorState message="Unable to load help desk." onRetry={() => refetch()} />
    );
  }

  return (
    <AgentPageFrame
      title="Help Desk"
      description="Headless Zendesk channel — tickets and Messaging via API. No sidebar app in this launch."
      actions={
        <Button
          variant="outline"
          render={<Link href={getConnectorPath(desk.slug, desk.connectorId)} />}
        >
          Open Zendesk connection
        </Button>
      }
    >
      <Card className="max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{desk.name}</CardTitle>
            <Badge variant={desk.status === "active" ? "success" : "warning"}>
              {desk.status === "active" ? "Connected" : "Reconnect required"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{desk.identifier}</p>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
            <div>
              <Label htmlFor="use-channel">Use as conversation channel</Label>
              <p className="text-xs text-muted-foreground">
                Route inbound Zendesk Messaging threads to this agent. Knowledge
                enablement stays on Build → Knowledge.
              </p>
            </div>
            <Switch
              id="use-channel"
              checked={desk.useChannel}
              disabled={updateHelpDesk.isPending || desk.status !== "active"}
              onCheckedChange={(checked) =>
                updateHelpDesk.mutate({ useChannel: checked })
              }
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Routing: inherit organization default. Handover destination is
            configured in Settings and can use this same Zendesk instance or a
            different helpdesk.
          </p>
        </CardContent>
      </Card>
    </AgentPageFrame>
  );
}
