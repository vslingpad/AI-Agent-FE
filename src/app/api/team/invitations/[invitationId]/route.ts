import { NextResponse } from "next/server";
import { requireOrgAdmin } from "@/lib/api/auth";
import { clerkErrorResponse } from "@/lib/api/clerk-errors";
import { revokeTeamInvitation } from "@/lib/team/clerk-team";

type RouteContext = {
  params: Promise<{ invitationId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  const { invitationId } = await context.params;

  try {
    const invitation = await revokeTeamInvitation(
      authResult.orgId,
      invitationId,
      authResult.userId
    );
    return NextResponse.json(invitation);
  } catch (error) {
    return clerkErrorResponse(error);
  }
}
