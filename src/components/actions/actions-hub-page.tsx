"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRightIcon, CodeXmlIcon } from "lucide-react";
import { ConnectActionRow } from "@/components/actions/connect-action-row";
import { ShowAllActionsDialog } from "@/components/actions/show-all-actions-dialog";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { ConnectorStatusBadge } from "@/components/integrations/integration-utils";
import { useBuildPageMeta, useBuildSearchQuery } from "@/components/build/use-build-page-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomToolsHub } from "@/hooks/use-custom-tools";
import { useIntegrationsHub } from "@/hooks/use-integrations";
import { hasActionCapability, matchesCustomActionsSearch, connectedActionNames } from "@/lib/actions/action-utils";
import {
  getConnectorPath,
} from "@/lib/integrations/connector-paths";
import type {
  IntegrationCatalogItem,
  OrgConnector,
} from "@/lib/schemas/integrations";

export function ActionsHubPage() {
  const { data: hub, isLoading: hubLoading, isError: hubError, refetch } =
    useIntegrationsHub();
  const { data: toolsHub, isLoading: toolsLoading } = useCustomToolsHub();
  const [showAllOpen, setShowAllOpen] = useState(false);
  const { searchQuery } = useBuildSearchQuery();

  useBuildPageMeta({
    enableSearch: true,
    searchPlaceholder: "Search actions…",
  });

  const actionCatalog = useMemo(
    () =>
      (hub?.catalog ?? [])
        .filter((item) => hasActionCapability(item.capabilities))
        .sort((a, b) => a.sort_order - b.sort_order),
    [hub]
  );

  const connectedActions = useMemo(
    () =>
      (hub?.connectors ?? []).filter(
        (connector) =>
          hasActionCapability(connector.capabilities) &&
          connector.status !== "disconnected" &&
          connector.status !== "pending_oauth"
      ),
    [hub]
  );

  const filteredCatalog = useMemo(
    () => filterActionCatalog(actionCatalog, searchQuery),
    [actionCatalog, searchQuery]
  );

  const filteredConnected = useMemo(
    () => filterConnectedActions(connectedActions, hub?.catalog ?? [], searchQuery),
    [connectedActions, hub, searchQuery]
  );

  const showCustomCard = matchesCustomActionsSearch(searchQuery);
  const hasConnectedResults =
    showCustomCard || filteredConnected.length > 0;

  if (hubLoading || toolsLoading) {
    return <ActionsHubSkeleton />;
  }

  if (hubError || !hub) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
        <p className="text-sm text-muted-foreground">Unable to load actions.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 pb-8 pt-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Actions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What your agents can do beyond answering — connector actions and
          custom HTTP calls.
        </p>
      </div>

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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 max-w-5xl">
            {showCustomCard ? (
              <CustomActionsCard count={toolsHub?.tools.length ?? 0} />
            ) : null}
            {filteredConnected.map((connector) => (
              <ConnectedActionCard
                key={connector.id}
                connector={connector}
                catalog={hub.catalog}
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
    </div>
  );
}

function CustomActionsCard({ count }: { count: number }) {
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
                  {count}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-1 pt-1 text-sm font-medium text-teal-900 dark:text-teal-200">
            <ChevronRightIcon className="size-4" />
            View, edit, and add custom actions
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ConnectedActionCard({
  connector,
  catalog,
}: {
  connector: OrgConnector;
  catalog: IntegrationCatalogItem[];
}) {
  const catalogItem = catalog.find(
    (item) => item.slug === connector.integration_slug
  );
  const highlights = connectedActionNames(connector.integration_slug, {
    catalogHighlights: catalogItem?.action_highlights,
  });
  const detailPath = getConnectorPath(connector.integration_slug, connector.id, {
    tab: "actions",
  });

  return (
    <Link href={detailPath} className="block h-full">
      <Card
        size="sm"
        className="h-full transition-shadow hover:shadow-sm"
      >
        <CardContent className="flex h-full flex-col gap-4">
          <div className="flex items-start gap-3">
            <IntegrationBrandIcon slug={connector.integration_slug} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {connector.display_name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {connector.identifier}
                  </p>
                </div>
                {connector.status === "active" ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </span>
                ) : (
                  <ConnectorStatusBadge status={connector.status} />
                )}
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
    </Link>
  );
}

function ActionsHubSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-8 px-6 pb-8 pt-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-24 w-23" />
        <Skeleton className="h-24 w-23" />
        <Skeleton className="h-24 w-23" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
    </div>
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
    matchesQuery(query, [item.name, item.description, item.slug, ...item.action_highlights])
  );
}

function filterConnectedActions(
  connectors: OrgConnector[],
  catalog: IntegrationCatalogItem[],
  query: string
) {
  return connectors.filter((connector) => {
    const catalogItem = catalog.find(
      (item) => item.slug === connector.integration_slug
    );

    return matchesQuery(query, [
      connector.display_name,
      connector.identifier,
      connector.integration_slug,
      catalogItem?.name,
      ...connectedActionNames(connector.integration_slug, {
        catalogHighlights: catalogItem?.action_highlights,
      }),
    ]);
  });
}
