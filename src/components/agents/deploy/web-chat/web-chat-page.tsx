"use client";

import { useEffect, useState } from "react";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentErrorState, AgentWebChatSkeleton } from "@/components/agents/agent-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAgentWebChat, useUpdateAgentWebChat } from "@/hooks/use-agents";
import type { WebChatConfig } from "@/lib/schemas/agents";

const textareaClassName =
  "min-h-20 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AgentWebChatPage({ agentId }: { agentId: string }) {
  const { data: webChat, isLoading, isError, refetch } = useAgentWebChat(agentId);
  const updateWebChat = useUpdateAgentWebChat(agentId);
  const [config, setConfig] = useState<WebChatConfig | null>(null);
  const [domainDraft, setDomainDraft] = useState("");

  useEffect(() => {
    if (webChat) {
      setConfig(webChat);
    }
  }, [webChat]);

  if (isLoading || (webChat && !config)) {
    return <AgentWebChatSkeleton />;
  }

  if (isError || !webChat || !config) {
    return (
      <AgentErrorState message="Unable to load web chat." onRetry={() => refetch()} />
    );
  }

  const snippet = `<script
  src="https://cdn.lingpad.ai/widget/v1/loader.js"
  data-agent-id="${agentId}"
  data-publishable-key="${config.publishableKey}"
  async
></script>`;

  const save = () => updateWebChat.mutate({ webChat: config });

  return (
    <AgentPageFrame
      title="Web Chat"
      description="Embed this agent on your site. Domain allowlist is checked with the publishable key."
      actions={
        <Button onClick={save} disabled={updateWebChat.isPending}>
          {updateWebChat.isPending ? "Saving…" : "Save"}
        </Button>
      }
    >
      <div className="grid max-w-3xl gap-4">
        <Card>
          <CardContent className="flex items-center justify-between gap-3 py-4">
            <div>
              <p className="font-medium">Widget enabled</p>
              <p className="text-sm text-muted-foreground">
                Customers can chat with this agent on allowlisted domains.
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, enabled: checked })
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="greeting">Greeting</Label>
              <Input
                id="greeting"
                value={config.greeting}
                onChange={(event) =>
                  setConfig({ ...config, greeting: event.target.value })
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="position">Position</Label>
                <select
                  id="position"
                  className={selectClassName}
                  value={config.position}
                  onChange={(event) =>
                    setConfig({
                      ...config,
                      position: event.target.value as WebChatConfig["position"],
                    })
                  }
                >
                  <option value="right">Bottom right</option>
                  <option value="left">Bottom left</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="color">Primary color</Label>
                <Input
                  id="color"
                  value={config.primaryColor}
                  onChange={(event) =>
                    setConfig({ ...config, primaryColor: event.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domain allowlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={domainDraft}
                onChange={(event) => setDomainDraft(event.target.value)}
                placeholder="acme.com"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const next = domainDraft.trim().toLowerCase();
                  if (!next || config.domainAllowlist.includes(next)) {
                    return;
                  }
                  setConfig({
                    ...config,
                    domainAllowlist: [...config.domainAllowlist, next],
                  });
                  setDomainDraft("");
                }}
              >
                Add
              </Button>
            </div>
            <ul className="divide-y rounded-lg border border-border">
              {config.domainAllowlist.length === 0 ? (
                <li className="px-4 py-3 text-sm text-muted-foreground">
                  No domains yet. The widget will reject unknown hosts.
                </li>
              ) : (
                config.domainAllowlist.map((domain) => (
                  <li
                    key={domain}
                    className="flex items-center justify-between px-4 py-2 text-sm"
                  >
                    <span className="font-mono text-xs">{domain}</span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() =>
                        setConfig({
                          ...config,
                          domainAllowlist: config.domainAllowlist.filter(
                            (item) => item !== domain
                          ),
                        })
                      }
                    >
                      Remove
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Embed snippet</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea readOnly value={snippet} className={`${textareaClassName} font-mono text-xs`} />
          </CardContent>
        </Card>
      </div>
    </AgentPageFrame>
  );
}
