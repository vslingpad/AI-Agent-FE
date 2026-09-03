import { NextResponse } from "next/server";
import { apiError, requireOrgAdmin, requireOrgId } from "@/lib/api/auth";
import { clerkErrorResponse } from "@/lib/api/clerk-errors";
import { getOrganizationSettings, updateOrganizationName } from "@/lib/org/clerk-org-settings";
import { UpdateOrganizationSettingsInputSchema } from "@/lib/schemas/org-settings";

export async function GET() {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const settings = await getOrganizationSettings(authResult.orgId);
    return NextResponse.json(settings);
  } catch (error) {
    return clerkErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireOrgAdmin();

  if ("error" in authResult) {
    return authResult.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = UpdateOrganizationSettingsInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid request body");
  }

  try {
    const settings = await updateOrganizationName(authResult.orgId, parsed.data.name);
    return NextResponse.json(settings);
  } catch (error) {
    return clerkErrorResponse(error);
  }
}
