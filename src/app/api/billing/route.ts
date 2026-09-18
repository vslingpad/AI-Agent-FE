import { NextResponse } from "next/server";
import { apiError, requireOrgAdmin, requireOrgId } from "@/lib/api/auth";
import { parseJsonBody } from "@/lib/api/agent-routes";
import {
  ControlPlaneAuthError,
  controlPlaneFetch,
  detailToError,
  isPlainObject,
  jsonFromResponse,
} from "@/lib/api/control-plane";
import { composeBillingOverview } from "@/lib/billing/compose-overview";
import { UpdateBillingSettingsInputSchema } from "@/lib/schemas/billing";

function backendError(status: number, body: unknown) {
  if (isPlainObject(body) && "detail" in body) {
    return apiError(detailToError(body.detail), status);
  }

  if (isPlainObject(body) && typeof body.error === "string") {
    return apiError(body.error, status);
  }

  return apiError(
    status >= 500 ? "Control plane unavailable" : "Request failed",
    status
  );
}

async function readJson(path: string, init?: RequestInit) {
  const response = await controlPlaneFetch(path, init);
  const payload = await jsonFromResponse(response);
  return { response, payload };
}

async function loadBillingOverview() {
  const [usage, plans, agents, connectors] = await Promise.all([
    readJson("/billing/usage"),
    readJson("/billing/plans"),
    readJson("/agents"),
    readJson("/orgs/me/connectors"),
  ]);

  if (!usage.response.ok) {
    return { error: backendError(usage.response.status, usage.payload) };
  }

  return {
    overview: composeBillingOverview(
      usage.payload,
      plans.response.ok ? plans.payload : [],
      agents.response.ok ? agents.payload : { agents: [] },
      connectors.response.ok ? connectors.payload : { connectors: [] }
    ),
  };
}

export async function GET() {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const result = await loadBillingOverview();
    if ("error" in result) {
      return result.error;
    }

    return NextResponse.json(result.overview);
  } catch (error) {
    if (error instanceof ControlPlaneAuthError) {
      return apiError("Unauthorized", 401);
    }

    console.error("Billing overview failed", error);
    return apiError("Control plane unavailable", 502);
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  const parsed = await parseJsonBody(request, UpdateBillingSettingsInputSchema);

  if ("error" in parsed) {
    return parsed.error;
  }

  try {
    const { response, payload } = await readJson("/billing/settings", {
      method: "PATCH",
      body: JSON.stringify({ allow_overage: parsed.data.allowOverage }),
    });

    if (!response.ok) {
      return backendError(response.status, payload);
    }

    const [plans, agents, connectors] = await Promise.all([
      readJson("/billing/plans"),
      readJson("/agents"),
      readJson("/orgs/me/connectors"),
    ]);

    return NextResponse.json(
      composeBillingOverview(
        payload,
        plans.response.ok ? plans.payload : [],
        agents.response.ok ? agents.payload : { agents: [] },
        connectors.response.ok ? connectors.payload : { connectors: [] }
      )
    );
  } catch (error) {
    if (error instanceof ControlPlaneAuthError) {
      return apiError("Unauthorized", 401);
    }

    console.error("Billing settings update failed", error);
    return apiError("Control plane unavailable", 502);
  }
}

export async function POST() {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const { response, payload } = await readJson("/billing/portal", {
      method: "POST",
    });

    if (!response.ok) {
      return backendError(response.status, payload);
    }

    const session = isPlainObject(payload) ? payload : {};
    const url = typeof session.url === "string" ? session.url : "";
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof ControlPlaneAuthError) {
      return apiError("Unauthorized", 401);
    }

    console.error("Billing portal session failed", error);
    return apiError("Control plane unavailable", 502);
  }
}
