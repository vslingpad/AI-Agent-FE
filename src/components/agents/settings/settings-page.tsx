"use client";

import { useState, type ReactNode } from "react";
import { Show, useOrganization } from "@clerk/nextjs";
import { useResetKey } from "@/hooks/use-reset-key";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { DeleteAgentDialog } from "@/components/agents/dialogs/delete-agent-dialog";
import { AgentErrorState, AgentSettingsSkeleton } from "@/components/agents/agent-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAgent,
  useAgentSettings,
  useUpdateAgent,
  useUpdateAgentSettings,
} from "@/hooks/use-agents";

const textareaClassName =
  "min-h-32 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60";

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type SettingsTab = "general" | "handover";

export function AgentSettingsPage({ agentId }: { agentId: string }) {
  const { membership } = useOrganization();
  const isAdmin = membership?.role === "org:admin";
  const {
    data: agent,
    isLoading: agentLoading,
    isError: agentError,
    refetch: refetchAgent,
  } = useAgent(agentId);
  const {
    data: settings,
    isLoading: settingsLoading,
    isError: settingsError,
    refetch: refetchSettings,
  } = useAgentSettings(agentId);
  const updateAgent = useUpdateAgent(agentId);
  const updateSettings = useUpdateAgentSettings(agentId);

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [handoverConnectorId, setHandoverConnectorId] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (useResetKey(agent) && agent) {
    setName(agent.name);
    setDescription(agent.description);
  }

  if (useResetKey(settings) && settings) {
    setPrompt(settings.systemPrompt);
    setHandoverConnectorId(settings.handoverConnectorId);
  }

  const isLoading = agentLoading || settingsLoading;
  const isError = agentError || settingsError;

  if (isLoading) {
    return <AgentSettingsSkeleton />;
  }

  if (isError || !agent || !settings) {
    return (
      <AgentErrorState
        message="Unable to load settings."
        onRetry={() => {
          void refetchAgent();
          void refetchSettings();
        }}
      />
    );
  }

  const saving = updateAgent.isPending || updateSettings.isPending;

  const save = async () => {
    const tasks: Array<Promise<unknown>> = [];

    if (
      isAdmin &&
      (name.trim() !== agent.name || description.trim() !== agent.description)
    ) {
      tasks.push(
        updateAgent.mutateAsync({
          name: name.trim(),
          description: description.trim(),
        })
      );
    }

    if (activeTab === "general") {
      tasks.push(
        updateSettings.mutateAsync({
          settings: { systemPrompt: prompt },
        })
      );
    } else {
      tasks.push(
        updateSettings.mutateAsync({
          settings: { handoverConnectorId },
        })
      );
    }

    await Promise.all(tasks);
  };

  return (
    <>
      <AgentPageFrame
        title="Settings"
        description="Agent identity, system prompt, and human handover configuration."
        actions={
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        }
      >
        <Tabs
          className="max-w-3xl"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as SettingsTab)}
        >
          <TabsList>
            <TabsTrigger value="general">General settings</TabsTrigger>
            <TabsTrigger value="handover">Handover settings</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Name">
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    readOnly={!isAdmin}
                    disabled={!isAdmin}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    readOnly={!isAdmin}
                    disabled={!isAdmin}
                    className={textareaClassName}
                    rows={3}
                  />
                </Field>
                {!isAdmin ? (
                  <p className="text-xs text-muted-foreground">
                    Ask an admin to update the agent name or description.
                  </p>
                ) : null}
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

            <Show when={{ role: "org:admin" }}>
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Danger zone</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Delete this agent</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently remove this agent and all of its configuration.
                    </p>
                  </div>
                  <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                    Delete agent
                  </Button>
                </CardContent>
              </Card>
            </Show>
          </TabsContent>

          <TabsContent value="handover" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Handover & escalation</CardTitle>
                <CardDescription>
                  Choose where conversations go when the AI transfers to a human.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 w-1/2">
                <Field label="Target">
                  <select
                    className={selectClassName}
                    value={handoverConnectorId}
                    onChange={(event) => setHandoverConnectorId(event.target.value)}
                  >
                    <option value="conn_zd_us">Zendesk — US Support</option>
                  </select>
                </Field>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AgentPageFrame>

      <DeleteAgentDialog
        agent={{ id: agent.id, name: agent.name }}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectOnDelete
      />
    </>
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
