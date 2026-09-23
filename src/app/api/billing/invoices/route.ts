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
import { OrgInvoiceListSchema } from "@/lib/schemas/billing";

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

export async function GET() {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const response = await controlPlaneFetch("/billing/invoices");
    const payload = await jsonFromResponse(response);

    if (!response.ok) {
      return backendError(response.status, payload);
    }

    const camel = keysToCamel(payload);
    const invoices = OrgInvoiceListSchema.parse(camel);
    return NextResponse.json(invoices);
  } catch (error) {
    if (error instanceof ControlPlaneAuthError) {
      return apiError("Unauthorized", 401);
    }

    console.error("Billing invoices failed", error);
    return apiError("Control plane unavailable", 502);
  }
}
