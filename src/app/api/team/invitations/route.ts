import { NextResponse } from "next/server";
import { apiError, requireOrgAdmin } from "@/lib/api/auth";
import { clerkErrorResponse } from "@/lib/api/clerk-errors";
import { createTeamInvitation, listTeamInvitations } from "@/lib/team/clerk-team";
import { parseTeamListQuery, toClerkPagination } from "@/lib/team/pagination";
import { CreateTeamInvitationInputSchema } from "@/lib/schemas/team";

export async function GET(request: Request) {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const query = parseTeamListQuery(new URL(request.url).searchParams);
    const pagination = toClerkPagination(query);
    const { invitations, totalCount } = await listTeamInvitations(
      authResult.orgId,
      {
        ...pagination,
        search: query.query,
      }
    );

    return NextResponse.json({
      invitations,
      totalCount,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    return clerkErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = CreateTeamInvitationInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid request body");
  }

  try {
    const invitation = await createTeamInvitation(authResult.orgId, {
      emailAddress: parsed.data.emailAddress,
      role: parsed.data.role,
      inviterUserId: authResult.userId,
    });
    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    return clerkErrorResponse(error);
  }
}
