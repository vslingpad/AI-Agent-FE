export function hasActionCapability(capabilities: string[]) {
  return capabilities.includes("action");
}

export const AVAILABLE_ACTION_CONNECTOR_SLUGS = [
  "zendesk",
  "calendly",
  "stripe",
] as const;

export function isActionConnectorAvailable(slug: string) {
  return (AVAILABLE_ACTION_CONNECTOR_SLUGS as readonly string[]).includes(slug);
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

