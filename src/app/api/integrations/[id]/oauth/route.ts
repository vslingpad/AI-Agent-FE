import { NextResponse } from "next/server";
import { apiError, requireOrgId } from "@/lib/api/auth";
import { completeOAuthStep } from "@/lib/fixtures/integrations-store";
import { CompleteOAuthStepInputSchema } from "@/lib/schemas/integrations";

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
  const parsed = CompleteOAuthStepInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid request body");
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  try {
    const result = completeOAuthStep(
      authResult.orgId,
      id,
      parsed.data.connectSessionId,
      parsed.data.stepId
    );
    return NextResponse.json(result);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "OAuth step failed"
    );
  }
}
