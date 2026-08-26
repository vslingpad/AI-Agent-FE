import { NextResponse } from "next/server";
import { apiError, requireOrgId } from "@/lib/api/auth";
import {
  deleteCustomTool,
  updateCustomTool,
} from "@/lib/fixtures/custom-tools-store";
import { UpdateCustomToolInputSchema } from "@/lib/schemas/custom-tools";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = UpdateCustomToolInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid request body");
  }

  try {
    const tool = updateCustomTool(authResult.orgId, id, parsed.data);
    return NextResponse.json(tool);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to update custom action",
      error instanceof Error && error.message === "Custom action not found"
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
    deleteCustomTool(authResult.orgId, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to delete custom action",
      404
    );
  }
}
