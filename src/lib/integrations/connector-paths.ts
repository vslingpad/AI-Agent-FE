import type { OrgConnector } from "@/lib/schemas/integrations";

export function getConnectorPath(
  slug: string,
  id: string,
  options?: { tab?: DetailTab }
) {
  const path = `/integrations/${slug}/${id}`;

  if (options?.tab) {
    return `${path}?tab=${options.tab}`;
  }

  return path;
}

export function getConnectWizardPath(
  slug: string,
  options?: { from?: "actions" }
) {
  const path = `/integrations/new/${slug}`;

  if (options?.from) {
    return `${path}?from=${options.from}`;
  }

  return path;
}

export function formatConnectorIdentifier(
  slug: string,
  externalInstanceId: string | null,
  config: Record<string, unknown>
): string {
  const subdomain =
    externalInstanceId ?? (config.subdomain as string | undefined) ?? null;

  switch (slug) {
    case "zendesk":
      return subdomain ? `support.${subdomain}.zendesk.com` : "—";
    case "calendly":
      return (config.accountEmail as string | undefined) ?? externalInstanceId ?? "—";
    case "stripe":
      return (config.accountId as string | undefined) ?? externalInstanceId ?? "—";
    case "freshdesk":
      return subdomain ? `${subdomain}.freshdesk.com` : "—";
    case "shopify":
      return (config.shopDomain as string | undefined) ?? externalInstanceId ?? "—";
    default:
      return externalInstanceId ?? "—";
  }
}

export function enrichConnector(connector: Omit<OrgConnector, "identifier"> & Partial<Pick<OrgConnector, "identifier">>): OrgConnector {
  return {
    ...connector,
    identifier: formatConnectorIdentifier(
      connector.integrationSlug,
      connector.externalInstanceId,
      connector.config
    ),
  };
}

export function formatConnectedDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function formatLastSyncAttempt(isoDate: string | null) {
  if (!isoDate) {
    return "Never";
  }

  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return "Just now";
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export const INTEGRATION_BRAND: Record<
  string,
  { abbr: string; className: string }
> = {
  zendesk: {
    abbr: "ZD",
    className: "bg-teal-700 text-white",
  },
  calendly: {
    abbr: "CA",
    className: "bg-blue-600 text-white",
  },
  stripe: {
    abbr: "ST",
    className: "bg-violet-600 text-white",
  },
  freshdesk: {
    abbr: "FD",
    className: "bg-emerald-600 text-white",
  },
  intercom: {
    abbr: "IC",
    className: "bg-sky-600 text-white",
  },
  hubspot: {
    abbr: "HS",
    className: "bg-orange-500 text-white",
  },
  zoho_desk: {
    abbr: "ZO",
    className: "bg-red-600 text-white",
  },
  shopify: {
    abbr: "SH",
    className: "bg-green-700 text-white",
  },
  gorgias: {
    abbr: "GO",
    className: "bg-indigo-600 text-white",
  },
};

export type DetailTab = "overview" | "actions";

export function isDetailTab(value: string | null | undefined): value is DetailTab {
  return value === "overview" || value === "actions";
}

export function getDetailTabs(_slug: string): DetailTab[] {
  return ["overview", "actions"];
}

export const TAB_LABELS: Record<DetailTab, string> = {
  overview: "Overview",
  actions: "Actions",
};
