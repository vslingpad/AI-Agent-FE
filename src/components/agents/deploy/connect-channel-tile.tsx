"use client";

import Link from "next/link";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { getConnectWizardPath } from "@/lib/integrations/connector-paths";
import type { DeployChannelDefinition } from "@/lib/deploy/channels-catalog";
import type { IntegrationCatalogItem } from "@/lib/schemas/integrations";
import { cn } from "@/lib/utils";

export type DeployChannelTile =
  | { kind: "catalog"; item: IntegrationCatalogItem }
  | { kind: "extra"; channel: DeployChannelDefinition };

export function ConnectChannelTile({ tile }: { tile: DeployChannelTile }) {
  const className =
    "flex w-28 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3 text-center";

  if (tile.kind === "catalog") {
    const { item } = tile;

    if (item.available) {
      return (
        <Link
          href={getConnectWizardPath(item.slug, { from: "deploy" })}
          className={cn(className, "transition-colors hover:bg-muted/40")}
        >
          <IntegrationBrandIcon slug={item.slug} />
          <span className="w-full truncate text-xs font-medium">{item.name}</span>
        </Link>
      );
    }

    return (
      <div className={cn(className, "opacity-80")}>
        <IntegrationBrandIcon slug={item.slug} />
        <span className="w-full truncate text-xs font-medium">{item.name}</span>
        <span className="text-[11px] text-muted-foreground">Coming soon</span>
      </div>
    );
  }

  return (
    <div className={cn(className, "opacity-80")}>
      <IntegrationBrandIcon slug={tile.channel.iconSlug} />
      <span className="w-full truncate text-xs font-medium">{tile.channel.label}</span>
      <span className="text-[11px] text-muted-foreground">Coming soon</span>
    </div>
  );
}
