import { NextResponse } from "next/server";
import { apiError, requireOrgAdmin } from "@/lib/api/auth";
import { clerkErrorResponse } from "@/lib/api/clerk-errors";
import { removeTeamMember, updateTeamMemberRole } from "@/lib/team/clerk-team";
import { UpdateTeamMemberInputSchema } from "@/lib/schemas/team";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  const { userId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = UpdateTeamMemberInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid request body");
  }

  try {
    const member = await updateTeamMemberRole(
      authResult.orgId,
      userId,
      parsed.data.role
    );
    return NextResponse.json(member);
  } catch (error) {
    return clerkErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  const { userId } = await context.params;

  try {
    await removeTeamMember(authResult.orgId, userId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return clerkErrorResponse(error);
  }
}
