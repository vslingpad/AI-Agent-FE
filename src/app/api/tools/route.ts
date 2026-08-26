import { NextResponse } from "next/server";
import { apiError, requireOrgId } from "@/lib/api/auth";
import {
  createCustomTool,
  getCustomToolsHub,
  setCustomToolsEnabled,
} from "@/lib/fixtures/custom-tools-store";
import {
  CreateCustomToolInputSchema,
  UpdateCustomToolsSettingsInputSchema,
} from "@/lib/schemas/custom-tools";

export async function GET() {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  await new Promise((resolve) => setTimeout(resolve, 150));

  return NextResponse.json(getCustomToolsHub(authResult.orgId));
}

export async function POST(request: Request) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = CreateCustomToolInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid request body");
  }

  const tool = createCustomTool(authResult.orgId, parsed.data);
  return NextResponse.json(tool, { status: 201 });
}

export async function PATCH(request: Request) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = UpdateCustomToolsSettingsInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid request body");
  }

  return NextResponse.json(
    setCustomToolsEnabled(authResult.orgId, parsed.data.enabled)
  );
}
