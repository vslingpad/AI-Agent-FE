import type { ZodType } from "zod";
import { NextResponse } from "next/server";
import { apiError, requireOrgId } from "@/lib/api/auth";

export type AgentRouteContext = {
  params: Promise<{ agentId: string }>;
};

export async function withAgentOrg(
  handler: (orgId: string) => NextResponse | Promise<NextResponse>
) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  return handler(authResult.orgId);
}

export async function withAgentId(
  context: AgentRouteContext,
  handler: (orgId: string, agentId: string) => NextResponse | Promise<NextResponse>
) {
  return withAgentOrg(async (orgId) => {
    const { agentId } = await context.params;
    return handler(orgId, agentId);
  });
}

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>
): Promise<{ data: T } | { error: NextResponse }> {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return { error: apiError("Invalid request body") };
  }

  return { data: parsed.data };
}

export function agentNotFound() {
  return apiError("Agent not found", 404);
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
