"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { SearchIcon, XIcon } from "lucide-react";
import { useResetKey } from "@/hooks/use-reset-key";
import {
  type DeployChannelTile,
} from "@/components/agents/deploy/connect-channel-tile";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { DeployChannelDefinition } from "@/lib/deploy/channels-catalog";
import { getConnectWizardPath } from "@/lib/integrations/connector-paths";
import type { IntegrationCatalogItem } from "@/lib/schemas/integrations";
import { cn } from "@/lib/utils";

type ShowAllChannelsDialogProps = {
  catalog: IntegrationCatalogItem[];
  extraChannels: DeployChannelDefinition[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function matchesChannelSearch(label: string, slug: string, query: string) {
  if (!query.trim()) {
    return true;
  }

  const normalized = query.trim().toLowerCase();

  return (
    label.toLowerCase().includes(normalized) || slug.toLowerCase().includes(normalized)
  );
}

export function ShowAllChannelsDialog({
  catalog,
  extraChannels,
  open,
  onOpenChange,
}: ShowAllChannelsDialogProps) {
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  if (useResetKey(open) && open) {
    setQuery("");
  }

  const filteredCatalog = catalog.filter((item) =>
    matchesChannelSearch(item.name, item.slug, query)
  );
  const filteredExtra = extraChannels.filter((channel) =>
    matchesChannelSearch(channel.label, channel.iconSlug, query)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={panelRef}
        initialFocus={panelRef}
        showCloseButton={false}
        className="max-h-[min(85vh,720px)] overflow-y-auto sm:max-w-3xl"
      >
        <DialogHeader className="flex-row items-center gap-3">
          <DialogTitle className="shrink-0">Connect a channel</DialogTitle>
          <div className="relative ml-auto w-74">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search channels…"
              className="h-9 pl-8"
              aria-label="Search channels"
            />
          </div>
          <DialogClose
            render={
              <Button variant="ghost" size="icon-sm" className="shrink-0" />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        {filteredCatalog.length === 0 && filteredExtra.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No channels match “{query.trim()}”.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {filteredCatalog.map((item) => (
              <ShowAllChannelItem key={item.slug} item={item} />
            ))}
            {filteredExtra.map((channel) => (
              <ShowAllExtraChannelItem key={channel.id} channel={channel} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ShowAllChannelItem({ item }: { item: IntegrationCatalogItem }) {
  const className =
    "flex h-14 items-center justify-start gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors";

  if (item.available) {
    return (
      <Link
        href={getConnectWizardPath(item.slug, { from: "deploy" })}
        className={cn(className, "hover:bg-muted/50")}
      >
        <IntegrationBrandIcon slug={item.slug} size="sm" />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  }

  return (
    <div className={cn(className, "opacity-80")}>
      <IntegrationBrandIcon slug={item.slug} size="sm" />
      <span className="min-w-0 flex-1 truncate">{item.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground">Coming soon</span>
    </div>
  );
}

function ShowAllExtraChannelItem({ channel }: { channel: DeployChannelDefinition }) {
  return (
    <div className="flex h-14 items-center justify-start gap-2 rounded-lg border border-border px-3 text-sm font-medium opacity-80">
      <IntegrationBrandIcon slug={channel.iconSlug} size="sm" />
      <span className="min-w-0 flex-1 truncate">{channel.label}</span>
      <span className="shrink-0 text-xs text-muted-foreground">Coming soon</span>
    </div>
  );
}

export function buildDeployChannelTiles(
  catalog: IntegrationCatalogItem[],
  extraChannels: DeployChannelDefinition[]
): DeployChannelTile[] {
  const catalogTiles: DeployChannelTile[] = catalog.map((item) => ({
    kind: "catalog",
    item,
  }));
  const extraTiles: DeployChannelTile[] = extraChannels.map((channel) => ({
    kind: "extra",
    channel,
  }));

  return [...catalogTiles, ...extraTiles];
}
