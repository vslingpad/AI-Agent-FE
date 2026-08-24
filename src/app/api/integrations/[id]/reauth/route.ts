import { NextResponse } from "next/server";
import { apiError, requireOrgId } from "@/lib/api/auth";
import { startReauth } from "@/lib/fixtures/integrations-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  const { id } = await context.params;

  try {
    const session = startReauth(authResult.orgId, id);
    return NextResponse.json(session);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to start reauth",
      404
    );
  }
}
