import type {
  AuthKeysInput,
  AuthPublic,
  CreateCustomToolInput,
  CustomTool,
  CustomToolAuthType,
  CustomToolsHub,
  UpdateCustomToolInput,
} from "@/lib/schemas/custom-tools";

type ToolSecrets = {
  apiKey?: string;
  token?: string;
  password?: string;
  clientSecret?: string;
};

type StoredTool = CustomTool & {
  secrets: ToolSecrets;
};

type OrgToolsState = {
  enabled: boolean;
  tools: StoredTool[];
};

const orgTools = new Map<string, OrgToolsState>();

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number) {
  return hoursAgo(days * 24);
}

function hasAnySecret(secrets: ToolSecrets) {
  return Boolean(
    secrets.apiKey || secrets.token || secrets.password || secrets.clientSecret
  );
}

function toPublicTool(stored: StoredTool): CustomTool {
  const { secrets, ...tool } = stored;

  return {
    ...tool,
    auth: {
      ...tool.auth,
      hasSecret: hasAnySecret(secrets),
    },
  };
}

function createSeedTools(): StoredTool[] {
  const now = new Date().toISOString();

  return [
    {
      id: "tool_order_lookup",
      slug: "order_lookup",
      displayName: "Order Lookup",
      description: "Returns status & tracking for an order",
      httpMethod: "GET",
      endpointUrl: "https://api.acme.com/v1/orders/{{args.order_id}}",
      authType: "api_key",
      auth: {
        headerName: "X-API-Key",
        hasSecret: true,
      },
      secrets: { apiKey: "seed_key" },
      responseMapping: {
        mode: "json_path",
        paths: ["status", "carrier", "tracking_url"],
      },
      proceduresEnabled: true,
      usedByAgentCount: 2,
      createdAt: now,
      updatedAt: hoursAgo(3),
    },
    {
      id: "tool_create_refund",
      slug: "create_refund",
      displayName: "Create Refund",
      description: "Issues a refund, capped at $50",
      httpMethod: "POST",
      endpointUrl: "https://api.acme.com/v1/refunds",
      authType: "oauth2",
      auth: {
        tokenUrl: "https://api.acme.com/oauth/token",
        clientId: "acme_refunds",
        scope: "refunds:write",
        hasSecret: true,
      },
      secrets: { clientSecret: "seed_secret" },
      responseMapping: {
        mode: "json_path",
        paths: ["refund_id", "status", "amount"],
      },
      proceduresEnabled: true,
      usedByAgentCount: 1,
      createdAt: now,
      updatedAt: daysAgo(1),
    },
    {
      id: "tool_loyalty_balance",
      slug: "loyalty_points_balance",
      displayName: "Loyalty Points Balance",
      description: "Reads points balance by email",
      httpMethod: "GET",
      endpointUrl: "https://api.acme.com/v1/loyalty/balance",
      authType: "api_key",
      auth: {
        headerName: "X-API-Key",
        hasSecret: true,
      },
      secrets: { apiKey: "seed_key" },
      responseMapping: {
        mode: "full_body",
        paths: [],
      },
      proceduresEnabled: false,
      usedByAgentCount: 1,
      createdAt: now,
      updatedAt: daysAgo(14),
    },
    {
      id: "tool_warranty_check",
      slug: "warranty_check",
      displayName: "Warranty Check",
      description: "Validates serial number against warranty DB",
      httpMethod: "GET",
      endpointUrl: "https://api.acme.com/v1/warranty/{{args.serial}}",
      authType: "basic",
      auth: {
        username: "warranty-svc",
        hasSecret: true,
      },
      secrets: { password: "seed_password" },
      responseMapping: {
        mode: "json_path",
        paths: ["covered", "expires_at"],
      },
      proceduresEnabled: false,
      usedByAgentCount: 0,
      createdAt: now,
      updatedAt: daysAgo(5),
    },
  ];
}

function getOrgState(orgId: string): OrgToolsState {
  if (!orgTools.has(orgId)) {
    orgTools.set(orgId, {
      enabled: true,
      tools: createSeedTools(),
    });
  }

  return orgTools.get(orgId)!;
}

function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function publicAuthFromKeys(
  authType: CustomToolAuthType,
  keys: AuthKeysInput | undefined,
  secrets: ToolSecrets
): AuthPublic {
  return {
    headerName: authType === "api_key" ? keys?.headerName?.trim() : undefined,
    username: authType === "basic" ? keys?.username?.trim() : undefined,
    tokenUrl: authType === "oauth2" ? keys?.tokenUrl?.trim() : undefined,
    clientId: authType === "oauth2" ? keys?.clientId?.trim() : undefined,
    scope: authType === "oauth2" ? keys?.scope?.trim() : undefined,
    hasSecret: authType === "none" ? false : hasAnySecret(secrets),
  };
}

function mergeSecrets(
  authType: CustomToolAuthType,
  keys: AuthKeysInput | undefined,
  existing: ToolSecrets
): ToolSecrets {
  if (authType === "none") {
    return {};
  }

  const next: ToolSecrets = { ...existing };

  if (keys?.apiKey?.trim()) {
    next.apiKey = keys.apiKey.trim();
  }

  if (keys?.token?.trim()) {
    next.token = keys.token.trim();
  }

  if (keys?.password?.trim()) {
    next.password = keys.password.trim();
  }

  if (keys?.clientSecret?.trim()) {
    next.clientSecret = keys.clientSecret.trim();
  }

  if (authType !== "api_key") {
    delete next.apiKey;
  }

  if (authType !== "bearer") {
    delete next.token;
  }

  if (authType !== "basic") {
    delete next.password;
  }

  if (authType !== "oauth2") {
    delete next.clientSecret;
  }

  return next;
}

export function getCustomToolsHub(orgId: string): CustomToolsHub {
  const state = getOrgState(orgId);

  return {
    enabled: state.enabled,
    tools: state.tools.map(toPublicTool),
  };
}

export function setCustomToolsEnabled(orgId: string, enabled: boolean) {
  const state = getOrgState(orgId);
  state.enabled = enabled;

  return getCustomToolsHub(orgId);
}

export function createCustomTool(orgId: string, input: CreateCustomToolInput) {
  const state = getOrgState(orgId);
  const now = new Date().toISOString();
  let slug = slugify(input.displayName) || "custom_action";

  const existingSlugs = new Set(state.tools.map((tool) => tool.slug));
  if (existingSlugs.has(slug)) {
    slug = `${slug}_${generateId("x").slice(-4)}`;
  }

  const secrets = mergeSecrets(input.authType, input.authKeys, {});
  const stored: StoredTool = {
    id: generateId("tool"),
    slug,
    displayName: input.displayName.trim(),
    description: input.description.trim(),
    httpMethod: input.httpMethod,
    endpointUrl: input.endpointUrl.trim(),
    authType: input.authType,
    auth: publicAuthFromKeys(input.authType, input.authKeys, secrets),
    secrets,
    responseMapping: {
      mode: input.responseMapping.mode,
      paths:
        input.responseMapping.mode === "json_path"
          ? input.responseMapping.paths.filter((path) => path.trim())
          : [],
    },
    proceduresEnabled: input.proceduresEnabled,
    usedByAgentCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  state.tools.unshift(stored);
  return toPublicTool(stored);
}

export function updateCustomTool(
  orgId: string,
  toolId: string,
  input: UpdateCustomToolInput
) {
  const state = getOrgState(orgId);
  const index = state.tools.findIndex((tool) => tool.id === toolId);

  if (index === -1) {
    throw new Error("Custom action not found");
  }

  const existing = state.tools[index]!;
  const authType = input.authType ?? existing.authType;
  const authKeys = input.authKeys ?? {
    headerName: existing.auth.headerName,
    username: existing.auth.username,
    tokenUrl: existing.auth.tokenUrl,
    clientId: existing.auth.clientId,
    scope: existing.auth.scope,
  };
  const secrets = mergeSecrets(authType, input.authKeys, existing.secrets);
  const responseMapping = input.responseMapping ?? existing.responseMapping;

  const updated: StoredTool = {
    ...existing,
    displayName: input.displayName?.trim() ?? existing.displayName,
    description: input.description?.trim() ?? existing.description,
    httpMethod: input.httpMethod ?? existing.httpMethod,
    endpointUrl: input.endpointUrl?.trim() ?? existing.endpointUrl,
    authType,
    auth: publicAuthFromKeys(authType, authKeys, secrets),
    secrets,
    responseMapping: {
      mode: responseMapping.mode,
      paths:
        responseMapping.mode === "json_path"
          ? responseMapping.paths.filter((path) => path.trim())
          : [],
    },
    proceduresEnabled: input.proceduresEnabled ?? existing.proceduresEnabled,
    updatedAt: new Date().toISOString(),
  };

  state.tools[index] = updated;
  return toPublicTool(updated);
}

export function deleteCustomTool(orgId: string, toolId: string) {
  const state = getOrgState(orgId);
  const index = state.tools.findIndex((tool) => tool.id === toolId);

  if (index === -1) {
    throw new Error("Custom action not found");
  }

  state.tools.splice(index, 1);
  return { success: true };
}
