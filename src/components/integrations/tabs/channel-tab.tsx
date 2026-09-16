"use client";

import { Show } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { ConnectorDetail } from "@/lib/schemas/integrations";

type ChannelTabProps = {
  connector: ConnectorDetail;
  defaultAgentId: string;
  onDefaultAgentChange: (value: string) => void;
  onDefaultAgentSave: () => void;
};

export function ChannelTab({
  connector,
  defaultAgentId,
  onDefaultAgentChange,
  onDefaultAgentSave,
}: ChannelTabProps) {
  const channel = connector.channel;

  if (!channel) {
    return (
      <Card className="w-full max-w-6xl">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Channel capability is not enabled for this connection.
        </CardContent>
      </Card>
    );
  }

  const webhookVariant =
    channel.webhook_status === "healthy"
      ? "success"
      : channel.webhook_status === "degraded"
        ? "warning"
        : "destructive";

  return (
    <div className="grid w-full max-w-6xl gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Messaging channel</CardTitle>
          <p className="text-sm text-muted-foreground">
            Zendesk Sunshine Messaging receives customer conversations via
            webhook.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Messaging</span>
            <Badge variant={channel.messaging_enabled ? "success" : "muted"}>
              {channel.messaging_enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Webhook health</span>
            <Badge variant={webhookVariant}>{channel.webhook_status}</Badge>
          </div>
          {channel.sunshine_app_id && (
            <div className="space-y-1">
              <Label>Sunshine app ID</Label>
              <p className="font-mono text-xs text-muted-foreground">
                {channel.sunshine_app_id}
              </p>
            </div>
          )}
          {channel.webhook_url && (
            <div className="space-y-1">
              <Label>Webhook URL</Label>
              <p className="break-all font-mono text-xs text-muted-foreground">
                {channel.webhook_url}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Routing</CardTitle>
          <p className="text-sm text-muted-foreground">
            Default agent when no tag or queue rule matches.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Show when={{ role: "org:admin" }}>
            <div className="space-y-2">
              <Label htmlFor="default-agent">Default routing agent</Label>
              <Input
                id="default-agent"
                value={defaultAgentId}
                onChange={(event) => onDefaultAgentChange(event.target.value)}
                onBlur={onDefaultAgentSave}
                placeholder="Agent project ID or slug"
              />
            </div>
          </Show>

          {channel.tag_rules.length > 0 && (
            <div className="space-y-2">
              <Label>Tag rules</Label>
              <div className="divide-y rounded-lg border border-border">
                {channel.tag_rules.map((rule) => (
                  <div
                    key={rule.tag}
                    className="flex items-center justify-between px-3 py-2 text-sm"
                  >
                    <span className="font-mono text-xs">{rule.tag}</span>
                    <span className="text-muted-foreground">{rule.agent_id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
