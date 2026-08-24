import { NextResponse } from "next/server";
import { apiError, requireOrgId } from "@/lib/api/auth";
import {
  createOrgConnector,
  getIntegrationsHub,
} from "@/lib/fixtures/integrations-store";
import { CreateConnectorInputSchema } from "@/lib/schemas/integrations";

export async function GET() {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  await new Promise((resolve) => setTimeout(resolve, 200));

  return NextResponse.json(getIntegrationsHub(authResult.orgId));
}

export async function POST(request: Request) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = CreateConnectorInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid request body");
  }

  try {
    const result = createOrgConnector(authResult.orgId, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to create connector"
    );
  }
}
