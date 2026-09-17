"use client";

import { useState } from "react";
import { ChevronLeftIcon, CodeXmlIcon } from "lucide-react";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUpdateAgentActions } from "@/hooks/use-agents";
import type { AgentActionBinding } from "@/lib/schemas/agents";

type AgentActionDetailProps = {
  agentId: string;
  binding: AgentActionBinding;
  onBack: () => void;
};

export function AgentActionDetail({
  agentId,
  binding,
  onBack,
}: AgentActionDetailProps) {
  const updateActions = useUpdateAgentActions(agentId);
  const [bulkPending, setBulkPending] = useState(false);
  const enabledCount = binding.subActions.filter((item) => item.enabled).length;
  const totalCount = binding.subActions.length;
  const allEnabled = totalCount > 0 && enabledCount === totalCount;
  const noneEnabled = enabledCount === 0;
  const controlsDisabled =
    !binding.connected || updateActions.isPending || bulkPending;

  async function setAllSubActions(enabled: boolean) {
    const toUpdate = binding.subActions.filter((item) => item.enabled !== enabled);
    if (toUpdate.length === 0) {
      return;
    }

    setBulkPending(true);
    try {
      for (const subAction of toUpdate) {
        await updateActions.mutateAsync({
          actionId: binding.id,
          actionSubActionId: subAction.id,
          actionSubActionEnabled: enabled,
        });
      }
    } finally {
      setBulkPending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit" onClick={onBack}>
          <ChevronLeftIcon className="size-4" />
          Back to actions
        </Button>

        <div className="flex items-start gap-3">
          {binding.kind === "custom_tool" ? (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-800 text-white">
              <CodeXmlIcon className="size-5" />
            </div>
          ) : (
            <IntegrationBrandIcon slug={binding.slug} />
          )}
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {binding.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {binding.identifier ?? binding.description}
              {binding.connected ? " · Connected" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Actions for this agent</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Choose which actions this agent can call from {binding.name}.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={controlsDisabled || allEnabled}
              onClick={() => void setAllSubActions(true)}
            >
              Enable all
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={controlsDisabled || noneEnabled}
              onClick={() => void setAllSubActions(false)}
            >
              Disable all
            </Button>
          </div>
        </div>

        <ul className="divide-y divide-border rounded-lg border border-border">
          {binding.subActions.map((subAction) => (
            <li
              key={subAction.id}
              className="flex items-start justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{subAction.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {subAction.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Label htmlFor={`${binding.id}-${subAction.id}`} className="sr-only">
                  Enable {subAction.name}
                </Label>
                <Switch
                  id={`${binding.id}-${subAction.id}`}
                  checked={subAction.enabled}
                  disabled={controlsDisabled}
                  onCheckedChange={(checked) =>
                    updateActions.mutate({
                      actionId: binding.id,
                      actionSubActionId: subAction.id,
                      actionSubActionEnabled: checked,
                    })
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
