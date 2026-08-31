"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { CreateAgentDialog } from "@/components/agents/dialogs/create-agent-dialog";
import { AgentErrorState, AgentListSkeleton } from "@/components/agents/agent-states";
import { useBuildPageMeta, useBuildSearchQuery } from "@/components/build/use-build-page-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
          onClick={() => setCreateOpen(true)}
          disabled={atLimit}
          title={atLimit ? "Plan agent limit reached" : undefined}
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
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      <CreateAgentDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function AgentCard({ agent }: { agent: AgentListItem }) {
  return (
    <Link href={agentPath(agent.id)} className="group block">
      <Card className="h-full transition-shadow group-hover:shadow-sm">
        <CardContent className="gap-4">
          <div className="min-w-0 space-y-1">
            <p className="font-medium" title={agent.name}>
              {limitChars(agent.name, NAME_MAX_CHARS)}
            </p>
            <p className="text-sm text-muted-foreground" title={agent.description}>
              {limitChars(agent.description, DESCRIPTION_MAX_CHARS)}
            </p>
          </div>

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
        </CardContent>
      </Card>
    </Link>
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
