"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EllipsisVerticalIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Show } from "@clerk/nextjs";
import { PlanLimitReachedDialog } from "@/components/billing/plan-limit-reached-dialog";
import { CreateAgentDialog } from "@/components/agents/dialogs/create-agent-dialog";
import { DeleteAgentDialog } from "@/components/agents/dialogs/delete-agent-dialog";
import { UpdateAgentDialog } from "@/components/agents/dialogs/update-agent-dialog";
import { AgentErrorState, AgentListSkeleton } from "@/components/agents/agent-states";
import { useBuildPageMeta, useBuildSearchQuery } from "@/components/build/use-build-page-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAgentsList } from "@/hooks/use-agents";
import { agentPath } from "@/lib/navigation/agent-sections";
import type { AgentListItem } from "@/lib/schemas/agents";

const NAME_MAX_CHARS = 40;
const DESCRIPTION_MAX_CHARS = 80;

function limitChars(value: string, max: number) {
  const trimmed = value.trim();

  if (trimmed.length <= max) {
    return trimmed;
  }

  return `${trimmed.slice(0, max).trimEnd()}…`;
}

export function AgentsListPage() {
  const { data, isLoading, isError, refetch } = useAgentsList();
  const [createOpen, setCreateOpen] = useState(false);
  const [agentLimitOpen, setAgentLimitOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<AgentListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AgentListItem | null>(null);
  const { searchQuery } = useBuildSearchQuery();

  useBuildPageMeta({
    enableSearch: true,
    searchPlaceholder: "Search agents…",
  });

  const agents = useMemo(() => {
    const list = data?.agents ?? [];
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return list;
    }

    return list.filter((agent) =>
      [agent.name, agent.description].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [data, searchQuery]);

  if (isLoading) {
    return <AgentListSkeleton />;
  }

  if (isError || !data) {
    return (
      <AgentErrorState
        message="Unable to load agents."
        onRetry={() => refetch()}
      />
    );
  }

  const atLimit = data.agents.length >= data.planAgentLimit;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Agents
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Each agent has its own knowledge, actions, channels, and tests.
            {` ${data.agents.length} of ${data.planAgentLimit} on your plan.`}
          </p>
        </div>
        <Button
          onClick={() => {
            if (atLimit) {
              setAgentLimitOpen(true);
              return;
            }
            setCreateOpen(true);
          }}
        >
          <PlusIcon />
          Create agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm font-medium">No agents match that search</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different name, or create a new agent.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onUpdate={setUpdateTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CreateAgentDialog open={createOpen} onOpenChange={setCreateOpen} />

      <PlanLimitReachedDialog
        open={agentLimitOpen}
        onOpenChange={setAgentLimitOpen}
        resource="agents"
        limit={data.planAgentLimit}
      />

      <UpdateAgentDialog
        agent={updateTarget}
        open={Boolean(updateTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setUpdateTarget(null);
          }
        }}
      />

      <DeleteAgentDialog
        agent={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}

function AgentCard({
  agent,
  onUpdate,
  onDelete,
}: {
  agent: AgentListItem;
  onUpdate: (agent: AgentListItem) => void;
  onDelete: (agent: AgentListItem) => void;
}) {
  const detailPath = agentPath(agent.id);

  return (
    <Card className="group h-full transition-shadow hover:shadow-sm">
      <CardContent className="gap-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={detailPath} className="min-w-0 flex-1">
            <p className="font-medium hover:underline" title={agent.name}>
              {limitChars(agent.name, NAME_MAX_CHARS)}
            </p>
            <p
              className="mt-1 text-sm text-muted-foreground"
              title={agent.description}
            >
              {limitChars(agent.description, DESCRIPTION_MAX_CHARS)}
            </p>
          </Link>

          <Show when={{ role: "org:admin" }}>
            <AgentCardActions
              onUpdate={() => onUpdate(agent)}
              onDelete={() => onDelete(agent)}
            />
          </Show>
        </div>

        <Link href={detailPath} className="block">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <Metric label="Handled" value={String(agent.tickets)} />
            <Metric
              label="Resolved"
              value={agent.status === "draft" ? "—" : `${agent.resolutionRate}%`}
            />
            <Metric
              label="Handoff"
              value={agent.status === "draft" ? "—" : `${agent.handoffRate}%`}
            />
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

function AgentCardActions({
  onUpdate,
  onDelete,
}: {
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Agent actions"
            className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 data-popup-open:opacity-100"
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <EllipsisVerticalIcon className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-1">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
          onClick={() => {
            close();
            onUpdate();
          }}
        >
          <PencilIcon className="size-4" />
          Update
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
          onClick={() => {
            close();
            onDelete();
          }}
        >
          <Trash2Icon className="size-4" />
          Delete
        </button>
      </PopoverContent>
    </Popover>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums">{value}</p>
    </div>
  );
}
