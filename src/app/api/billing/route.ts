import { NextResponse } from "next/server";
import { requireOrgAdmin } from "@/lib/api/auth";
import { parseJsonBody } from "@/lib/api/agent-routes";
import {
  createBillingPortalSession,
  getBillingOverview,
  updateBillingSettings,
} from "@/lib/fixtures/billing-store";
import { UpdateBillingSettingsInputSchema } from "@/lib/schemas/billing";

export async function GET() {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  return NextResponse.json(getBillingOverview(authResult.orgId));
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
    const overview = updateBillingSettings(authResult.orgId, parsed.data);
    return NextResponse.json(overview);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update billing settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST() {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  return NextResponse.json(createBillingPortalSession(authResult.orgId));
}
