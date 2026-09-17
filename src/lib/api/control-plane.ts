import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { apiError, requireOrgId } from "@/lib/api/auth";

const CAPABILITIES = new Set(["channel", "knowledge", "action"]);
const CATALOG_STATUSES = new Set(["active", "beta", "deprecated"]);
const CONFIG_FIELD_TYPES = new Set(["text", "url", "select"]);
const ID_KEYS = new Set(["id", "organization_id", "org_connector_id"]);

export function controlPlaneBaseUrl() {
  return (
    process.env.CONTROL_PLANE_URL?.replace(/\/$/, "") ||
    process.env.LINGPAD_AGENT_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8080"
  );
}

export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function toCamelKey(key: string) {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function toSnakeKey(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function mapKeys(
  value: unknown,
  mapKey: (key: string) => string
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => mapKeys(item, mapKey));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    out[mapKey(key)] = mapKeys(nested, mapKey);
  }
  return out;
}

export function keysToCamel(value: unknown) {
  return mapKeys(value, toCamelKey);
}

export function keysToSnake(value: unknown) {
  return mapKeys(value, toSnakeKey);
}

function stringifyIds(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stringifyIds);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (ID_KEYS.has(key) && (typeof nested === "number" || typeof nested === "bigint")) {
      out[key] = String(nested);
    } else {
      out[key] = stringifyIds(nested);
    }
  }
  return out;
}

function filterCaps(value: unknown) {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.filter(
    (item) => typeof item === "string" && CAPABILITIES.has(item)
  );
}

function normalizeIntegrationsShape(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeIntegrationsShape);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    out[key] = normalizeIntegrationsShape(nested);
  }

  if ("description" in out && out.description == null) {
    out.description = "";
  }

  if ("placeholder" in out && out.placeholder == null) {
    delete out.placeholder;
  }

  if ("options" in out && out.options == null) {
    delete out.options;
  }

  if ("connect_session_id" in out && out.connect_session_id == null) {
    out.connect_session_id = "";
  }

  if (Array.isArray(out.capabilities)) {
    out.capabilities = filterCaps(out.capabilities);
  }

  if (Array.isArray(out.enabled_capabilities)) {
    out.enabled_capabilities = filterCaps(out.enabled_capabilities);
  }

  if (
    typeof out.type === "string" &&
    "key" in out &&
    "label" in out &&
    !CONFIG_FIELD_TYPES.has(out.type)
  ) {
    out.type = "text";
  }

  if (
    typeof out.status === "string" &&
    "slug" in out &&
    "config_fields" in out &&
    !CATALOG_STATUSES.has(out.status)
  ) {
    out.status = "active";
  }

  if (
    "integration_slug" in out &&
    "id" in out &&
    (!out.connected_by || !isPlainObject(out.connected_by))
  ) {
    out.connected_by = {
      name: "",
      connected_at:
        typeof out.created_at === "string"
          ? out.created_at
          : new Date().toISOString(),
    };
  }

  if (
    "slug" in out &&
    "config_fields" in out &&
    typeof out.available !== "boolean"
  ) {
    out.available = out.slug === "zendesk" || out.slug === "web_widget";
  }

  if (Array.isArray(out.oauth_steps)) {
    out.oauth_steps = out.oauth_steps.map((step) => {
      if (!isPlainObject(step)) {
        return step;
      }
      return {
        ...step,
        description: typeof step.description === "string" ? step.description : "",
      };
    });
  }

  if (
    "slug" in out &&
    "config_fields" in out &&
    !Array.isArray(out.action_highlights)
  ) {
    out.action_highlights = [];
  }

  if (
    out.slug === "zendesk" &&
    !Array.isArray(out.knowledge_sub_capabilities)
  ) {
    out.knowledge_sub_capabilities = ["help_center", "tickets"];
  }

  if (isPlainObject(out.channel)) {
    const channel = out.channel as Record<string, unknown>;
    if (
      channel.default_routing_agent != null &&
      typeof channel.default_routing_agent !== "string"
    ) {
      channel.default_routing_agent = String(channel.default_routing_agent);
    }
    if (typeof channel.sunshine_app_id !== "string" && channel.sunshine_app_id != null) {
      channel.sunshine_app_id = String(channel.sunshine_app_id);
    }
    if (Array.isArray(channel.tag_rules)) {
      channel.tag_rules = channel.tag_rules.map((rule) => {
        if (!isPlainObject(rule)) {
          return rule;
        }
        const agentId = rule.agent_id ?? rule.agentId;
        if (agentId != null && typeof agentId !== "string") {
          return { ...rule, agent_id: String(agentId) };
        }
        if (typeof rule.agent_id === "string") {
          return rule;
        }
        if (typeof rule.agentId === "string") {
          return { ...rule, agent_id: rule.agentId };
        }
        return rule;
      });
    }
  }

  return out;
}

export function adaptConnectorPayload(value: unknown) {
  return normalizeIntegrationsShape(stringifyIds(value));
}

export function detailToError(detail: unknown): string {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (isPlainObject(detail)) {
    if (typeof detail.error === "string" && detail.error.trim()) {
      return detail.error;
    }

    if (typeof detail.msg === "string" && detail.msg.trim()) {
      return detail.msg;
    }

    if (typeof detail.message === "string" && detail.message.trim()) {
      return detail.message;
    }
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detailToError(detail[0]);
  }

  return "Request failed";
}

async function getClerkAccessToken() {
  const { getToken } = await auth();
  return getToken();
}

const GEO_HEADERS = [
  "x-vercel-ip-city",
  "x-vercel-ip-country",
  "x-vercel-ip-country-region",
  "cf-ipcity",
  "cf-ipcountry",
  "cf-region",
  "x-appengine-city",
  "x-appengine-country",
];

export async function controlPlaneFetch(
  path: string,
  init: RequestInit = {},
  incoming?: Request
): Promise<Response> {
  const token = await getClerkAccessToken();

  if (!token) {
    throw new ControlPlaneAuthError();
  }

  const url = `${controlPlaneBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (incoming) {
    for (const name of GEO_HEADERS) {
      const value = incoming.headers.get(name);
      if (value) {
        headers.set(name, value);
      }
    }
  }

  return fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export class ControlPlaneAuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "ControlPlaneAuthError";
  }
}

function errorFromBackend(status: number, body: unknown) {
  if (isPlainObject(body) && "detail" in body) {
    return apiError(detailToError(body.detail), status);
  }

  if (isPlainObject(body) && typeof body.error === "string") {
    return apiError(body.error, status);
  }

  return apiError(status >= 500 ? "Control plane unavailable" : "Request failed", status);
}

export async function jsonFromResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

type ProxyOptions = {
  rewriteBody?: (body: unknown) => unknown;
  rewriteSearch?: (params: URLSearchParams) => URLSearchParams;
  transformJson?: (json: unknown) => unknown;
};

export async function proxyControlPlane(
  request: Request,
  backendPath: string,
  options: ProxyOptions = {}
) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const incoming = new URL(request.url);
    const search = options.rewriteSearch
      ? options.rewriteSearch(new URLSearchParams(incoming.searchParams))
      : incoming.searchParams;
    const query = search.toString();
    const path = `${backendPath}${query ? `?${query}` : ""}`;

    const init: RequestInit = { method: request.method };
    const method = request.method.toUpperCase();

    if (method !== "GET" && method !== "HEAD" && method !== "DELETE") {
      const raw = await request.text();
      if (raw) {
        if (options.rewriteBody) {
          const parsed = JSON.parse(raw) as unknown;
          init.body = JSON.stringify(options.rewriteBody(parsed));
        } else {
          init.body = raw;
        }
      }
    }

    const response = await controlPlaneFetch(path, init, request);

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const contentType = response.headers.get("content-type") || "";
    if (
      contentType.includes("text/csv") ||
      contentType.includes("application/octet-stream")
    ) {
      const headers = new Headers();
      for (const name of ["content-type", "content-disposition", "cache-control"]) {
        const value = response.headers.get(name);
        if (value) {
          headers.set(name, value);
        }
      }
      return new NextResponse(await response.arrayBuffer(), {
        status: response.status,
        headers,
      });
    }

    const payload = await jsonFromResponse(response);

    if (!response.ok) {
      return errorFromBackend(response.status, payload);
    }

    const body = options.transformJson ? options.transformJson(payload) : payload;
    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    if (error instanceof ControlPlaneAuthError) {
      return apiError("Unauthorized", 401);
    }

    if (error instanceof SyntaxError) {
      return apiError("Invalid request body");
    }

    console.error("Control plane proxy failed", error);
    return apiError("Control plane unavailable", 502);
  }
}

export function snakeCaseSearch(params: URLSearchParams) {
  const next = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    next.set(toSnakeKey(key), value);
  }
  return next;
}
