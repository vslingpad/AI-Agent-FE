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
import { CreateCheckoutSessionInputSchema } from "@/lib/schemas/billing";

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

export async function POST(request: Request) {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  const parsed = await parseJsonBody(request, CreateCheckoutSessionInputSchema);

  if ("error" in parsed) {
    return parsed.error;
  }

  try {
    const response = await controlPlaneFetch("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({
        plan_tier: parsed.data.planTier,
        billing_interval: parsed.data.billingInterval,
        success_url: parsed.data.successUrl,
        cancel_url: parsed.data.cancelUrl,
      }),
    });
    const payload = await jsonFromResponse(response);

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

    console.error("Billing checkout session failed", error);
    return apiError("Control plane unavailable", 502);
  }
}
