import { NextResponse } from "next/server";
import { apiError, requireOrgAdmin } from "@/lib/api/auth";
import { parseJsonBody } from "@/lib/api/agent-routes";
import {
  ControlPlaneAuthError,
  controlPlaneFetch,
  detailToError,
  isPlainObject,
  jsonFromResponse,
} from "@/lib/api/control-plane";
import { composeBillingOverview } from "@/lib/billing/compose-overview";
import { ChangePlanInputSchema } from "@/lib/schemas/billing";

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

export async function POST(request: Request) {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  const parsed = await parseJsonBody(request, ChangePlanInputSchema);

  if ("error" in parsed) {
    return parsed.error;
  }

  try {
    const response = await controlPlaneFetch("/billing/change-plan", {
      method: "POST",
      body: JSON.stringify({
        plan_tier: parsed.data.planTier,
        billing_interval: parsed.data.billingInterval,
      }),
    });
    const payload = await jsonFromResponse(response);

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

    console.error("Billing change plan failed", error);
    return apiError("Control plane unavailable", 502);
  }
}
