"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import { AgentWorkspaceNav } from "@/components/agents/agent-workspace-nav";
import {
  AgentErrorState,
  AgentWorkspaceSkeleton,
} from "@/components/agents/agent-states";
import { Button } from "@/components/ui/button";
import { useAgent } from "@/hooks/use-agents";
import { agentPath } from "@/lib/navigation/agent-sections";
import type { ReactNode } from "react";

export function AgentWorkspaceShell({
  agentId,
  children,
}: {
  agentId: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { data, isLoading, isError, refetch } = useAgent(agentId);

  if (isLoading) {
    return <AgentWorkspaceSkeleton />;
  }

  if (isError || !data) {
    return (
      <AgentErrorState
        message="Unable to load this agent."
        onRetry={() => refetch()}
      />
    );
  }

  const onPlayground = pathname.includes("/test/playground");

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 pl-3 pr-6 py-2 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            render={<Link href="/agents" />}
          >
            <ChevronLeftIcon />
            Agents
          </Button>
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate font-heading text-sm font-semibold">
                  {data.name}
                </h1>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {data.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!onPlayground ? (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={agentPath(agentId, "test/playground")} />}
            >
              Playground
            </Button>
          ) : null}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <AgentWorkspaceNav agentId={agentId} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
