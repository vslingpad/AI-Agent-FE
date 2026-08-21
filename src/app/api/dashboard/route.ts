import { NextResponse } from "next/server";
import { getDashboardFixture } from "@/lib/fixtures/dashboard";
import { ChartPeriodSchema } from "@/lib/schemas/dashboard";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodParam = searchParams.get("period") ?? "30d";
  const parsedPeriod = ChartPeriodSchema.safeParse(periodParam);

  if (!parsedPeriod.success) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  const data = getDashboardFixture(parsedPeriod.data);

  return NextResponse.json(data);
}
