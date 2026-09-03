import { NextResponse } from "next/server";
import { apiError, requireOrgAdmin } from "@/lib/api/auth";
import { clerkErrorResponse } from "@/lib/api/clerk-errors";
import {
  deleteOrganizationLogo,
  updateOrganizationLogo,
} from "@/lib/org/clerk-org-settings";

export async function PUT(request: Request) {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return apiError("Logo file is required");
  }

  try {
    const settings = await updateOrganizationLogo(
      authResult.orgId,
      file,
      authResult.userId
    );
    return NextResponse.json(settings);
  } catch (error) {
    return clerkErrorResponse(error);
  }
}

export async function DELETE() {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const settings = await deleteOrganizationLogo(authResult.orgId);
    return NextResponse.json(settings);
  } catch (error) {
    return clerkErrorResponse(error);
  }
}
