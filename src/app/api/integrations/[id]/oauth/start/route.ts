import { NextResponse } from "next/server";
import { apiError, requireOrgId } from "@/lib/api/auth";
import { startOAuthStep } from "@/lib/fixtures/integrations-store";
import { StartOAuthStepInputSchema } from "@/lib/schemas/integrations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = StartOAuthStepInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid request body");
  }

  try {
    const session = startOAuthStep(
      authResult.orgId,
      id,
      parsed.data.stepId
    );
    return NextResponse.json(session);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to start OAuth",
      404
    );
  }
}
