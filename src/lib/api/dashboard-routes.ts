import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { apiError, requireOrgId } from "@/lib/api/auth";

export async function withDashboardOrg(
  handler: (orgId: string) => NextResponse | Promise<NextResponse>
) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  await new Promise((resolve) => setTimeout(resolve, 180));
  return handler(authResult.orgId);
}

export function parseSearchParams<T>(
  request: Request,
  schema: ZodType<T>
): { data: T } | { error: NextResponse } {
  const searchParams = new URL(request.url).searchParams;
  const raw: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    if (value) {
      raw[key] = value;
    }
  }

  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    return { error: apiError("Invalid query parameters") };
  }

  return { data: parsed.data };
}
