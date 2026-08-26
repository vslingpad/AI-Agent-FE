import type {
  ConnectorCapability,
  ConnectorStatus,
  SyncStatus,
} from "@/lib/schemas/integrations";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const CAPABILITY_LABELS: Record<ConnectorCapability, string> = {
  channel: "Channel",
  knowledge: "Knowledge",
  action: "Actions",
};

export function CapabilityChips({
  capabilities,
  enabledCapabilities,
  size = "default",
}: {
  capabilities: ConnectorCapability[];
  enabledCapabilities: ConnectorCapability[];
  size?: "default" | "sm";
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {capabilities.map((capability) => {
        const enabled = enabledCapabilities.includes(capability);

        return (
          <span
            key={capability}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium",
              size === "sm" ? "text-[11px]" : "text-xs",
              enabled
                ? "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300"
                : "border-border bg-muted/40 text-muted-foreground"
            )}
          >
            {enabled ? (
              <CheckIcon className="size-3 shrink-0" />
            ) : (
              <XIcon className="size-3 shrink-0 opacity-60" />
            )}
            {CAPABILITY_LABELS[capability]}
          </span>
        );
      })}
    </div>
  );
}

/** @deprecated Use CapabilityChips */
export function CapabilityBadges(props: {
  capabilities: ConnectorCapability[];
  enabledCapabilities: ConnectorCapability[];
}) {
  return <CapabilityChips {...props} />;
}

export function ConnectorStatusBadge({ status }: { status: ConnectorStatus }) {
  const config: Record<
    ConnectorStatus,
    { label: string; variant: "success" | "warning" | "muted" | "destructive" }
  > = {
    active: { label: "Connected", variant: "success" },
    pending_oauth: { label: "Pending authorization", variant: "warning" },
    reauth_required: { label: "Reconnect required", variant: "warning" },
    disconnected: { label: "Disconnected", variant: "muted" },
  };

  const { label, variant } = config[status];

  return <Badge variant={variant}>{label}</Badge>;
}

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const config: Record<
    SyncStatus,
    { label: string; dotClass: string; badgeClass: string }
  > = {
    synced: {
      label: "Synced",
      dotClass: "bg-emerald-500",
      badgeClass:
        "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    },
    sync_failed: {
      label: "Sync failed",
      dotClass: "bg-orange-500",
      badgeClass:
        "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
    },
    syncing: {
      label: "Syncing",
      dotClass: "bg-blue-500 animate-pulse",
      badgeClass:
        "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
    },
    never: {
      label: "Not synced",
      dotClass: "bg-muted-foreground/40",
      badgeClass: "border-border bg-muted/40 text-muted-foreground",
    },
  };

  const { label, dotClass, badgeClass } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        badgeClass
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotClass)} />
      {label}
    </span>
  );
}

export function getCatalogItem<T extends { slug: string }>(
  catalog: T[],
  slug: string
): T | undefined {
  return catalog.find((item) => item.slug === slug);
}

export function groupConnectorsBySlug<T extends { integrationSlug: string }>(
  connectors: T[]
) {
  return connectors.reduce<Record<string, T[]>>((acc, connector) => {
    const list = acc[connector.integrationSlug] ?? [];
    list.push(connector);
    acc[connector.integrationSlug] = list;
    return acc;
  }, {});
}

