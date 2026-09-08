import { jsonOk } from "@/lib/api/agent-routes";
import { parseSearchParams, withDashboardOrg } from "@/lib/api/dashboard-routes";
import { getDashboardActivityFixture } from "@/lib/fixtures/dashboard";
import { DashboardActivityQuerySchema } from "@/lib/schemas/dashboard";

export async function GET(request: Request) {
  return withDashboardOrg(async () => {
    const parsed = parseSearchParams(request, DashboardActivityQuerySchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    return jsonOk(getDashboardActivityFixture(parsed.data));
  });
}
