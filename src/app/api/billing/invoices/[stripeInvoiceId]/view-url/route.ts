import { NextResponse } from "next/server";
import { apiError, requireOrgAdmin } from "@/lib/api/auth";
import {
  ControlPlaneAuthError,
  controlPlaneFetch,
  detailToError,
  isPlainObject,
  jsonFromResponse,
  keysToCamel,
} from "@/lib/api/control-plane";
import { OrgInvoiceViewUrlSchema } from "@/lib/schemas/billing";

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

type RouteContext = { params: Promise<{ stripeInvoiceId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  const { stripeInvoiceId } = await context.params;
  if (!stripeInvoiceId?.trim()) {
    return apiError("Invoice id required", 400);
  }

  try {
    const response = await controlPlaneFetch(
      `/billing/invoices/${encodeURIComponent(stripeInvoiceId)}/view-url`
    );
    const payload = await jsonFromResponse(response);

    if (!response.ok) {
      return backendError(response.status, payload);
    }

    const camel = keysToCamel(payload);
    const body = OrgInvoiceViewUrlSchema.parse(camel);
    return NextResponse.json(body);
  } catch (error) {
    if (error instanceof ControlPlaneAuthError) {
      return apiError("Unauthorized", 401);
    }

    console.error("Billing invoice view URL failed", error);
    return apiError("Control plane unavailable", 502);
  }
}
