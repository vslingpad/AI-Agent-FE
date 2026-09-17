"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronRightIcon,
  CodeXmlIcon,
  SearchIcon,
} from "lucide-react";
import { ConnectActionRow } from "@/components/actions/connect-action-row";
import { ShowAllActionsDialog } from "@/components/actions/show-all-actions-dialog";
import { AgentActionDetail } from "@/components/agents/build/actions/agent-action-detail";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentActionsSkeleton, AgentErrorState } from "@/components/agents/agent-states";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCustomToolsHub } from "@/hooks/use-custom-tools";
import { useAgentActions } from "@/hooks/use-agents";
import { useIntegrationsHub } from "@/hooks/use-integrations";
import { hasActionCapability, matchesCustomActionsSearch, connectedActionNames } from "@/lib/actions/action-utils";
import type { AgentActionBinding } from "@/lib/schemas/agents";
import type { IntegrationCatalogItem } from "@/lib/schemas/integrations";
import { cn } from "@/lib/utils";

const CUSTOM_ACTION_BINDING_ID = "act_custom";

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
  const {
    data: toolsHub,
    isLoading: toolsLoading,
    isError: toolsError,
    refetch: refetchTools,
  } = useCustomToolsHub();
  const [showAllOpen, setShowAllOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewActionId, setViewActionId] = useState<string | null>(null);

  const actionCatalog = useMemo(
    () =>
      (hub?.catalog ?? [])
        .filter((item) => hasActionCapability(item.capabilities))
        .sort((a, b) => a.sort_order - b.sort_order),
    [hub]
  );

  const connectedBindings = useMemo(
    () =>
      sortConnectedActions(
        (actionsData?.actions ?? []).filter((action) => action.connected)
      ),
    [actionsData]
  );

  const customBinding = useMemo(
    () => connectedBindings.find((action) => action.id === CUSTOM_ACTION_BINDING_ID),
    [connectedBindings]
  );

  const connectorBindings = useMemo(
    () =>
      connectedBindings.filter((action) => action.id !== CUSTOM_ACTION_BINDING_ID),
    [connectedBindings]
  );

  const filteredCatalog = useMemo(
    () => filterActionCatalog(actionCatalog, searchQuery),
    [actionCatalog, searchQuery]
  );

  const filteredConnectors = useMemo(
    () => filterConnectedBindings(connectorBindings, searchQuery),
    [connectorBindings, searchQuery]
  );

  const showCustomCard = matchesCustomActionsSearch(searchQuery);

  const viewBinding = viewActionId
    ? actionsData?.actions.find((action) => action.id === viewActionId)
    : null;

  const hasConnectedResults = showCustomCard || filteredConnectors.length > 0;

  if (hubLoading || actionsLoading || toolsLoading) {
    return <AgentActionsSkeleton />;
  }

  if (agentError || hubError || toolsError || !hub || !actionsData || !toolsHub) {
    return (
      <AgentErrorState
        message="Unable to load actions."
        onRetry={() => {
          void refetchAgent();
          void refetchHub();
          void refetchTools();
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
          showCustomAction={matchesCustomActionsSearch(searchQuery)}
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
            {showCustomCard ? (
              customBinding ? (
                <ConnectedAgentActionCard
                  key={customBinding.id}
                  binding={customBinding}
                  catalog={hub.catalog}
                  onOpen={() => setViewActionId(customBinding.id)}
                />
              ) : (
                <CustomActionsSetupCard toolCount={toolsHub.tools.length} />
              )
            ) : null}
            {filteredConnectors.map((binding) => (
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

function CustomActionsSetupCard({ toolCount }: { toolCount: number }) {
  return (
    <Link href="/actions/custom" className="block h-full">
      <Card
        size="sm"
        className="h-full bg-teal-50/80 ring-teal-200/80 transition-shadow hover:shadow-sm dark:bg-teal-950/20 dark:ring-teal-900/60"
      >
        <CardContent className="flex h-full flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-800 text-white">
              <CodeXmlIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Custom actions</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Org-defined HTTP APIs
                  </p>
                </div>
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-teal-900 dark:bg-teal-950/60 dark:text-teal-100">
                  {toolCount}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-end gap-0.5 pt-1 text-sm font-medium text-teal-900 dark:text-teal-200">
            View, edit, and add custom actions
            <ChevronRightIcon className="size-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
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
  const highlights = connectedActionNames(binding.slug, {
    subActions: binding.subActions,
    catalogHighlights: catalogItem?.action_highlights,
  });
  const enabledCount = binding.subActions.filter((item) => item.enabled).length;
  const totalCount = binding.subActions.length;

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
                {totalCount > 0 ? (
                  <Badge variant="outline">
                      {enabledCount}/{totalCount} enabled
                  </Badge>
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
      
          <div className="mt-auto flex items-center justify-end gap-0.5 pt-1 text-sm font-medium text-foreground">
            Manage actions
            <ChevronRightIcon className="size-4" />
          </div>
       
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
    matchesQuery(query, [item.name, item.description, item.slug, ...(item.action_highlights ?? [])])
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
