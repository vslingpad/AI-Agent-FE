import { NextResponse } from "next/server";
import { requireOrgId } from "@/lib/api/auth";
import { clerkErrorResponse } from "@/lib/api/clerk-errors";
import { leaveOrganization } from "@/lib/org/clerk-org-settings";

export async function POST() {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    await leaveOrganization(authResult.orgId, authResult.userId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return clerkErrorResponse(error);
  }
}
