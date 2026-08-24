"use client";

import { useMemo, useState } from "react";
import {
  AvailableIntegrationCard,
  ConnectorInstanceCard,
} from "@/components/integrations/connector-instance-card";
import { DeleteConnectorDialog } from "@/components/integrations/delete-connector-dialog";
import {
  getFamilyLabel,
  groupConnectorsBySlug,
} from "@/components/integrations/integration-utils";
import { RenameConnectorDialog } from "@/components/integrations/rename-connector-dialog";
import { useBuildSearchQuery } from "@/components/build/use-build-page-meta";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntegrationsHub } from "@/hooks/use-integrations";
import type {
  IntegrationCatalogItem,
  OrgConnector,
} from "@/lib/schemas/integrations";

function matchesSearch(
  query: string,
  values: Array<string | null | undefined>
) {
  if (!query.trim()) {
    return true;
  }

  const normalized = query.trim().toLowerCase();

  return values.some((value) => value?.toLowerCase().includes(normalized));
}

function filterConnectors(connectors: OrgConnector[], query: string) {
  return connectors.filter((connector) =>
    matchesSearch(query, [
      connector.displayName,
      connector.identifier,
      connector.externalInstanceId,
      connector.integrationSlug,
    ])
  );
}

function filterCatalog(
  catalog: IntegrationCatalogItem[],
  query: string
) {
  return catalog.filter((item) =>
    matchesSearch(query, [item.name, item.description, item.slug])
  );
}

export function IntegrationsHubPage() {
  const { data, isLoading, isError, refetch } = useIntegrationsHub();
  const [renameTarget, setRenameTarget] = useState<OrgConnector | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrgConnector | null>(null);
  const { searchQuery } = useBuildSearchQuery();

  const filteredConnectors = useMemo(
    () => (data ? filterConnectors(data.connectors, searchQuery) : []),
    [data, searchQuery]
  );

  const filteredCatalog = useMemo(
    () => (data ? filterCatalog(data.catalog, searchQuery) : []),
    [data, searchQuery]
  );

  const grouped = useMemo(
    () => groupConnectorsBySlug(filteredConnectors),
    [filteredConnectors]
  );

  const families = useMemo(
    () => [
      ...new Set(filteredCatalog.map((item) => item.integrationFamily)),
    ],
    [filteredCatalog]
  );

  const hasResults =
    filteredConnectors.length > 0 || filteredCatalog.length > 0;

  if (isLoading) {
    return <IntegrationsHubSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
        <p className="text-sm text-muted-foreground">
          Unable to load integrations.
        </p>
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
          Integrations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect external systems once at the organization level. Agents bind
          to these connectors for channels, knowledge, and actions.
        </p>
        {data.planLimit !== null && (
          <p className="text-xs text-muted-foreground">
            {data.connectedCount} of {data.planLimit} integrations used on your
            plan
          </p>
        )}
      </div>

      {!hasResults && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm font-medium">No integrations found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different name, domain, or integration type.
          </p>
        </div>
      )}

      {filteredConnectors.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Connected</h2>
          <div className="grid grid-cols-[repeat(auto-fill,375px)] gap-4">
            {filteredConnectors.map((connector) => (
              <ConnectorInstanceCard
                key={connector.id}
                connector={connector}
                catalog={data.catalog}
                onRename={setRenameTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        </section>
      )}

      {families.map((family) => {
        const items = filteredCatalog.filter(
          (item) => item.integrationFamily === family
        );

        if (items.length === 0) {
          return null;
        }

        return (
          <section key={family} className="space-y-3">
            <h2 className="text-sm font-medium">{getFamilyLabel(family)}</h2>
            <div className="grid grid-cols-[repeat(auto-fill,375px)] gap-4">
              {items.map((item) => (
                <AvailableIntegrationCard
                  key={item.slug}
                  item={item}
                  connectedCount={grouped[item.slug]?.length ?? 0}
                />
              ))}
            </div>
          </section>
        );
      })}

      <RenameConnectorDialog
        connector={renameTarget}
        open={Boolean(renameTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRenameTarget(null);
          }
        }}
      />

      <DeleteConnectorDialog
        connector={deleteTarget}
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

function IntegrationsHubSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-8 px-6 pb-8 pt-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,375px)] gap-4">
        <Skeleton className="h-44 w-[375px]" />
        <Skeleton className="h-44 w-[375px]" />
        <Skeleton className="h-44 w-[375px]" />
      </div>
    </div>
  );
}
