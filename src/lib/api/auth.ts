import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function requireOrgId() {
  const { orgId, userId } = await auth();

  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!orgId) {
    return {
      error: NextResponse.json(
        { error: "Organization context required" },
        { status: 400 }
      ),
    };
  }

  return { orgId };
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
