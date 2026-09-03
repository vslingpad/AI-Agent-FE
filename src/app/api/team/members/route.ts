import { NextResponse } from "next/server";
import { requireOrgAdmin } from "@/lib/api/auth";
import { clerkErrorResponse } from "@/lib/api/clerk-errors";
import { listTeamMembers } from "@/lib/team/clerk-team";
import { parseTeamListQuery, toClerkPagination } from "@/lib/team/pagination";

export async function GET(request: Request) {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const query = parseTeamListQuery(new URL(request.url).searchParams);
    const pagination = toClerkPagination(query);
    const { members, totalCount } = await listTeamMembers(authResult.orgId, {
      ...pagination,
      search: query.query,
    });

    return NextResponse.json({
      members,
      totalCount,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    return clerkErrorResponse(error);
  }
}
