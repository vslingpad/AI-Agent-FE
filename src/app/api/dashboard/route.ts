import { NextResponse } from "next/server";
import { withDashboardOrg } from "@/lib/api/dashboard-routes";
import { getDashboardFixture } from "@/lib/fixtures/dashboard";
import { ChartPeriodSchema } from "@/lib/schemas/dashboard";

export async function GET(request: Request) {
  return withDashboardOrg(async () => {
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get("period") ?? "30d";
    const parsedPeriod = ChartPeriodSchema.safeParse(periodParam);

    if (!parsedPeriod.success) {
      return NextResponse.json({ error: "Invalid period" }, { status: 400 });
    }

    return NextResponse.json(getDashboardFixture(parsedPeriod.data));
  });
}
