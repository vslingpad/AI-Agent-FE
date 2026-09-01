"use client";

import Link from "next/link";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { isActionConnectorAvailable } from "@/lib/actions/action-utils";
import { getConnectWizardPath } from "@/lib/integrations/connector-paths";
import type { IntegrationCatalogItem } from "@/lib/schemas/integrations";
import { cn } from "@/lib/utils";

export function ConnectActionTile({ item }: { item: IntegrationCatalogItem }) {
  const available = isActionConnectorAvailable(item.slug);
  const className =
    "flex w-28 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3 text-center";

  if (available) {
    return (
      <Link
        href={getConnectWizardPath(item.slug, { from: "actions" })}
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
