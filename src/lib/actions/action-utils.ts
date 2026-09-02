import { isIntegrationAvailable } from "@/lib/integrations/availability";
import type { IntegrationCatalogItem } from "@/lib/schemas/integrations";

export function hasActionCapability(capabilities: string[]) {
  return capabilities.includes("action");
}

export function isActionConnectorAvailable(
  slug: string,
  catalog?: IntegrationCatalogItem[]
) {
  return isIntegrationAvailable(slug, catalog);
}

export function matchesCustomActionsSearch(query: string) {
  if (!query.trim()) {
    return true;
  }

  const normalized = query.trim().toLowerCase();

  return [
    "custom actions",
    "custom",
    "http",
    "api",
    "org-defined",
  ].some((value) => value.includes(normalized) || normalized.includes(value));
}

export const CUSTOM_TOOL_AUTH_LABELS: Record<string, string> = {
  none: "None",
  api_key: "API key",
  oauth2: "OAuth 2.0",
  basic: "Basic",
  bearer: "Bearer",
};

export const RESPONSE_MAPPING_LABELS: Record<string, string> = {
  full_body: "Full body",
  json_path: "JSON paths",
};

