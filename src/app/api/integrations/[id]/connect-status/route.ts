import { NextResponse } from "next/server";
import { apiError, requireOrgId } from "@/lib/api/auth";
import { getConnectSession } from "@/lib/fixtures/integrations-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const connectSessionId = searchParams.get("connectSessionId");

  if (!connectSessionId) {
    return apiError("connectSessionId is required");
  }

  const session = getConnectSession(connectSessionId);

  if (!session || session.orgConnectorId !== id) {
    return apiError("Connect session not found", 404);
  }

  if (session.organizationId !== authResult.orgId) {
    return apiError("Unauthorized", 403);
  }

  return NextResponse.json(session);
}
