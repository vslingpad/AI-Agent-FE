import { jsonOk } from "@/lib/api/agent-routes";
import { parseSearchParams, withDashboardOrg } from "@/lib/api/dashboard-routes";
import { getDashboardAiQualityFixture } from "@/lib/fixtures/dashboard";
import { DashboardAiQualityQuerySchema } from "@/lib/schemas/dashboard";

export async function GET(request: Request) {
  return withDashboardOrg(async () => {
    const parsed = parseSearchParams(request, DashboardAiQualityQuerySchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    return jsonOk(getDashboardAiQualityFixture(parsed.data.period));
  });
}
