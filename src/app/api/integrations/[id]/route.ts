import { NextResponse } from "next/server";
import { apiError, requireOrgId } from "@/lib/api/auth";
import {
  deleteOrgConnector,
  getConnectorDetail,
  updateOrgConnector,
} from "@/lib/fixtures/integrations-store";
import { UpdateConnectorInputSchema } from "@/lib/schemas/integrations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  const { id } = await context.params;
  const connector = getConnectorDetail(authResult.orgId, id);

  if (!connector || connector.status === "disconnected") {
    return apiError("Connector not found", 404);
  }

  return NextResponse.json(connector);
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = UpdateConnectorInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid request body");
  }

  try {
    const connector = updateOrgConnector(
      authResult.orgId,
      id,
      parsed.data
    );
    return NextResponse.json(getConnectorDetail(authResult.orgId, id));
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to update connector",
      error instanceof Error && error.message === "Connector not found"
        ? 404
        : 400
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  const { id } = await context.params;

  try {
    deleteOrgConnector(authResult.orgId, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to delete connector",
      404
    );
  }
}
