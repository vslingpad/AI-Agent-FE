"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentErrorState, AgentSettingsSkeleton } from "@/components/agents/agent-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAgentSettings, useUpdateAgentSettings } from "@/hooks/use-agents";
import type { AgentHandover, HandoverMode } from "@/lib/schemas/agents";

const textareaClassName =
  "min-h-32 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AgentSettingsPage({ agentId }: { agentId: string }) {
  const { data, isLoading, isError, refetch } = useAgentSettings(agentId);
  const updateSettings = useUpdateAgentSettings(agentId);
  const [prompt, setPrompt] = useState("");
  const [escalate, setEscalate] = useState(true);
  const [handover, setHandover] = useState<AgentHandover | null>(null);

  useEffect(() => {
    if (!data) {
      return;
    }

    setPrompt(data.systemPrompt);
    setEscalate(data.escalateOnLowConfidence);
    setHandover(data.handover);
  }, [data]);

  if (isLoading || (data && !handover)) {
    return <AgentSettingsSkeleton />;
  }

  if (isError || !data || !handover) {
    return (
      <AgentErrorState message="Unable to load settings." onRetry={() => refetch()} />
    );
  }

  const save = () => {
    updateSettings.mutate({
      settings: {
        systemPrompt: prompt,
        escalateOnLowConfidence: escalate,
        handover,
      },
    });
  };

  return (
    <AgentPageFrame
      title="Settings"
      description="Prompt, automatic model routing, and where humans receive escalations."
      actions={
        <Button onClick={save} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Saving…" : "Save"}
        </Button>
      }
    >
      <div className="grid max-w-3xl gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Model routing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Mode: Automatic (complexity-based). There is no per-agent model
              picker — tier is chosen at runtime.
            </p>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
              <Label htmlFor="escalate">
                Allow escalation to a higher tier on low confidence
              </Label>
              <Switch
                id="escalate"
                checked={escalate}
                onCheckedChange={setEscalate}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className={textareaClassName}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Handover & escalation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Independent of knowledge source and chat channel. Humans receive
              the conversation here when the AI transfers.
            </p>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">When a customer asks for a human</legend>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="handover-mode"
                  checked={handover.mode === "helpdesk"}
                  onChange={() =>
                    setHandover({ ...handover, mode: "helpdesk" satisfies HandoverMode })
                  }
                />
                Create ticket in helpdesk
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="handover-mode"
                  checked={handover.mode === "email"}
                  onChange={() => setHandover({ ...handover, mode: "email" })}
                />
                Email / contact page only
              </label>
            </fieldset>

            {handover.mode === "helpdesk" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Target">
                  <select
                    className={selectClassName}
                    value={handover.connectorId ?? ""}
                    onChange={(event) =>
                      setHandover({ ...handover, connectorId: event.target.value })
                    }
                  >
                    <option value="conn_zd_us">Zendesk — US Support</option>
                  </select>
                </Field>
                <Field label="Team">
                  <Input
                    value={handover.team}
                    onChange={(event) =>
                      setHandover({ ...handover, team: event.target.value })
                    }
                  />
                </Field>
                <Field label="Tags">
                  <Input
                    value={handover.tags}
                    onChange={(event) =>
                      setHandover({ ...handover, tags: event.target.value })
                    }
                  />
                </Field>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 sm:col-span-2">
                  <Label htmlFor="summary">Include AI summary as internal note</Label>
                  <Switch
                    id="summary"
                    checked={handover.includeAiSummary}
                    onCheckedChange={(checked) =>
                      setHandover({ ...handover, includeAiSummary: checked })
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Email">
                  <Input
                    value={handover.email}
                    onChange={(event) =>
                      setHandover({ ...handover, email: event.target.value })
                    }
                  />
                </Field>
                <Field label="Contact URL">
                  <Input
                    value={handover.contactUrl}
                    onChange={(event) =>
                      setHandover({ ...handover, contactUrl: event.target.value })
                    }
                  />
                </Field>
              </div>
            )}

            <Field label="Handoff message">
              <Input
                value={handover.handoffMessage}
                onChange={(event) =>
                  setHandover({ ...handover, handoffMessage: event.target.value })
                }
              />
            </Field>
          </CardContent>
        </Card>
      </div>
    </AgentPageFrame>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
