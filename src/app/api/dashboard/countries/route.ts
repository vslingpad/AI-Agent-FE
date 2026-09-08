import { jsonOk } from "@/lib/api/agent-routes";
import { parseSearchParams, withDashboardOrg } from "@/lib/api/dashboard-routes";
import { getDashboardCountriesFixture } from "@/lib/fixtures/dashboard";
import { DashboardCountriesQuerySchema } from "@/lib/schemas/dashboard";

export async function GET(request: Request) {
  return withDashboardOrg(async () => {
    const parsed = parseSearchParams(request, DashboardCountriesQuerySchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    return jsonOk(getDashboardCountriesFixture(parsed.data));
  });
}
