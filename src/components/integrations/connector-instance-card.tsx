"use client";

import Link from "next/link";
import {
  ChevronRightIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import {
  CapabilityChips,
  SyncStatusBadge,
  getCatalogItem,
} from "@/components/integrations/integration-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  INTEGRATION_BRAND,
  formatLastSyncAttempt,
  getConnectorPath,
} from "@/lib/integrations/connector-paths";
import type {
  IntegrationCatalogItem,
  OrgConnector,
} from "@/lib/schemas/integrations";
import { cn } from "@/lib/utils";

function IntegrationBrandIcon({ slug }: { slug: string }) {
  const brand = INTEGRATION_BRAND[slug] ?? {
    abbr: slug.slice(0, 2).toUpperCase(),
    className: "bg-muted text-muted-foreground",
  };

  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold tracking-tight",
        brand.className
      )}
    >
      {brand.abbr}
    </div>
  );
}

type ConnectorInstanceCardProps = {
  connector: OrgConnector;
  catalog: IntegrationCatalogItem[];
  onRename: (connector: OrgConnector) => void;
  onDelete: (connector: OrgConnector) => void;
};

export function ConnectorInstanceCard({
  connector,
  catalog,
  onRename,
  onDelete,
}: ConnectorInstanceCardProps) {
  const catalogItem = getCatalogItem(catalog, connector.integrationSlug);
  const detailPath = getConnectorPath(connector.integrationSlug, connector.id);

  return (
    <Card
      size="sm"
      className="group flex h-full flex-col transition-shadow hover:shadow-sm"
    >
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start gap-3">
          <IntegrationBrandIcon slug={connector.integrationSlug} />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={detailPath}
                  className="block truncate text-sm font-semibold hover:underline"
                >
                  {connector.displayName}
                </Link>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {connector.identifier}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <SyncStatusBadge status={connector.syncStatus} />
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Actions"
                        className="opacity-0 transition-opacity group-hover:opacity-100 data-popup-open:opacity-100"
                      />
                    }
                  >
                    <MoreHorizontalIcon />
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-44 p-1">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                      onClick={() => onRename(connector)}
                    >
                      <PencilIcon className="size-4" />
                      Rename
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(connector)}
                    >
                      <Trash2Icon className="size-4" />
                      Delete
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        {catalogItem && (
          <CapabilityChips
            capabilities={catalogItem.capabilities}
            enabledCapabilities={connector.enabledCapabilities}
            size="sm"
          />
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Last sync attempt: {formatLastSyncAttempt(connector.lastSyncAttemptAt)}
          </p>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            render={<Link href={detailPath} aria-label="Open integration" />}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type AvailableIntegrationCardProps = {
  item: IntegrationCatalogItem;
  connectedCount: number;
};

export function AvailableIntegrationCard({
  item,
  connectedCount,
}: AvailableIntegrationCardProps) {
  return (
    <Card size="sm" className="h-full">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start gap-3">
          <IntegrationBrandIcon slug={item.slug} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{item.name}</p>
              {connectedCount > 0 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  {connectedCount} connected
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {item.description}
            </p>
          </div>
        </div>

        <CapabilityChips
          capabilities={item.capabilities}
          enabledCapabilities={item.capabilities}
          size="sm"
        />

        <div className="mt-auto flex justify-end border-t border-border pt-3">
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/integrations/new/${item.slug}`} />}
          >
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { IntegrationBrandIcon };
