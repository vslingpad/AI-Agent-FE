"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CodeXmlIcon,
  LayoutGridIcon,
  SearchIcon,
} from "lucide-react";
import { ConnectActionTile } from "@/components/actions/connect-action-tile";
import { ShowAllActionsDialog } from "@/components/actions/show-all-actions-dialog";
import { AgentActionDetail } from "@/components/agents/build/actions/agent-action-detail";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentActionsSkeleton, AgentErrorState } from "@/components/agents/agent-states";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAgentActions } from "@/hooks/use-agents";
import { useIntegrationsHub } from "@/hooks/use-integrations";
import { hasActionCapability } from "@/lib/actions/action-utils";
import type { AgentActionBinding } from "@/lib/schemas/agents";
import type { IntegrationCatalogItem } from "@/lib/schemas/integrations";
import { cn } from "@/lib/utils";

const TILE_WIDTH = 92;
const TILE_GAP = 12;
const SHOW_ALL_WIDTH = 92;

export function AgentActionsPage({ agentId }: { agentId: string }) {
  return <AgentActionsPageContent key={agentId} agentId={agentId} />;
}

function AgentActionsPageContent({ agentId }: { agentId: string }) {
  const {
    data: actionsData,
    isLoading: actionsLoading,
    isError: agentError,
    refetch: refetchAgent,
  } = useAgentActions(agentId);
  const { data: hub, isLoading: hubLoading, isError: hubError, refetch: refetchHub } =
    useIntegrationsHub();
  const [showAllOpen, setShowAllOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewActionId, setViewActionId] = useState<string | null>(null);

  const actionCatalog = useMemo(
    () =>
      (hub?.catalog ?? [])
        .filter((item) => hasActionCapability(item.capabilities))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [hub]
  );

  const connectedBindings = useMemo(
    () =>
      sortConnectedActions(
        (actionsData?.actions ?? []).filter((action) => action.connected)
      ),
    [actionsData]
  );

  const filteredCatalog = useMemo(
    () => filterActionCatalog(actionCatalog, searchQuery),
    [actionCatalog, searchQuery]
  );

  const filteredConnected = useMemo(
    () => filterConnectedBindings(connectedBindings, searchQuery),
    [connectedBindings, searchQuery]
  );

  const viewBinding = viewActionId
    ? actionsData?.actions.find((action) => action.id === viewActionId)
    : null;

  const hasConnectedResults = filteredConnected.length > 0;

  if (hubLoading || actionsLoading) {
    return <AgentActionsSkeleton />;
  }

  if (agentError || hubError || !hub || !actionsData) {
    return (
      <AgentErrorState
        message="Unable to load actions."
        onRetry={() => {
          void refetchAgent();
          void refetchHub();
        }}
      />
    );
  }

  if (viewBinding?.connected) {
    return (
      <AgentActionDetail
        key={viewBinding.id}
        agentId={agentId}
        binding={viewBinding}
        onBack={() => setViewActionId(null)}
      />
    );
  }

  return (
    <AgentPageFrame
      title="Actions"
      description="Tools this agent can call during a conversation. Connect org integrations, then enable individual actions per agent."
      actions={
        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search actions…"
            className="h-9 pl-8"
            aria-label="Search actions"
          />
        </div>
      }
    >
      <section className="space-y-3">
        <h2 className="text-sm font-medium">Connect an action</h2>
        <ConnectActionRow
          catalog={filteredCatalog}
          onShowAll={() => setShowAllOpen(true)}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Connected actions</h2>
        {!hasConnectedResults ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm font-medium">No connected actions found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different connector, action, or custom API name.
            </p>
          </div>
        ) : (
          <div className="grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
            {filteredConnected.map((binding) => (
              <ConnectedAgentActionCard
                key={binding.id}
                binding={binding}
                catalog={hub.catalog}
                onOpen={() => setViewActionId(binding.id)}
              />
            ))}
          </div>
        )}
      </section>

      <ShowAllActionsDialog
        catalog={actionCatalog}
        open={showAllOpen}
        onOpenChange={setShowAllOpen}
      />
    </AgentPageFrame>
  );
}

function ConnectActionRow({
  catalog,
  onShowAll,
}: {
  catalog: IntegrationCatalogItem[];
  onShowAll: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const node = rowRef.current;

    if (!node) {
      return;
    }

    const update = () => {
      const width = node.clientWidth;
      const maxTiles = Math.max(
        1,
        Math.floor((width - SHOW_ALL_WIDTH - TILE_GAP) / (TILE_WIDTH + TILE_GAP))
      );
      setVisibleCount(Math.min(catalog.length, maxTiles));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => observer.disconnect();
  }, [catalog.length]);

  const visible = catalog.slice(0, visibleCount);
  const remaining = Math.max(0, catalog.length - visible.length);

  return (
    <div ref={rowRef} className="flex w-full items-stretch gap-3 overflow-hidden">
      {visible.map((item) => (
        <ConnectActionTile key={item.slug} item={item} />
      ))}

      <button
        type="button"
        onClick={onShowAll}
        className="flex w-23 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3 text-center transition-colors hover:bg-muted/40"
      >
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <LayoutGridIcon className="size-4" />
        </div>
        {remaining > 0 ? (
          <span className="text-[11px] text-muted-foreground">{remaining} more</span>
        ) : null}
        <span className="text-xs font-medium">Show all</span>
      </button>
    </div>
  );
}

function ConnectedAgentActionCard({
  binding,
  catalog,
  onOpen,
}: {
  binding: AgentActionBinding;
  catalog: IntegrationCatalogItem[];
  onOpen: () => void;
}) {
  const catalogItem = catalog.find((item) => item.slug === binding.slug);
  const highlights =
    binding.kind === "custom_tool"
      ? binding.subActions.map((subAction) => subAction.name)
      : (catalogItem?.actionHighlights ?? binding.subActions.map((item) => item.name));

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn("block h-full w-full text-left", binding.connected && "cursor-pointer")}
    >
      <Card size="sm" className="h-full transition-shadow hover:shadow-sm">
        <CardContent className="flex h-full flex-col gap-4">
          <div className="flex items-start gap-3">
            {binding.kind === "custom_tool" ? (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-800 text-white">
                <CodeXmlIcon className="size-5" />
              </div>
            ) : (
              <IntegrationBrandIcon slug={binding.slug} />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{binding.name}</p>
                  {binding.identifier ? (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {binding.identifier}
                    </p>
                  ) : null}
                </div>
                {binding.connected ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {highlights.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="inline-flex rounded-full border border-border bg-muted px-3.5 py-1.5 text-xs text-foreground"
                >
                  {highlight}
                </span>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </button>
  );
}

function matchesQuery(query: string, values: Array<string | null | undefined>) {
  if (!query.trim()) {
    return true;
  }

  const normalized = query.trim().toLowerCase();

  return values.some((value) => value?.toLowerCase().includes(normalized));
}

function filterActionCatalog(
  catalog: IntegrationCatalogItem[],
  query: string
) {
  return catalog.filter((item) =>
    matchesQuery(query, [item.name, item.description, item.slug, ...item.actionHighlights])
  );
}

function sortConnectedActions(bindings: AgentActionBinding[]) {
  return [...bindings].sort((a, b) => {
    if (a.kind === "custom_tool" && b.kind !== "custom_tool") {
      return -1;
    }

    if (a.kind !== "custom_tool" && b.kind === "custom_tool") {
      return 1;
    }

    return 0;
  });
}

function filterConnectedBindings(bindings: AgentActionBinding[], query: string) {
  return bindings.filter((binding) =>
    matchesQuery(query, [
      binding.name,
      binding.description,
      binding.slug,
      binding.identifier,
      ...binding.subActions.flatMap((subAction) => [
        subAction.name,
        subAction.description,
      ]),
    ])
  );
}
