import { jsonOk } from "@/lib/api/agent-routes";
import { parseSearchParams, withDashboardOrg } from "@/lib/api/dashboard-routes";
import { getDashboardAiQualityConversationsFixture } from "@/lib/fixtures/dashboard";
import { DashboardAiQualityConversationsQuerySchema } from "@/lib/schemas/dashboard";

export async function GET(request: Request) {
  return withDashboardOrg(async () => {
    const parsed = parseSearchParams(
      request,
      DashboardAiQualityConversationsQuerySchema
    );

    if ("error" in parsed) {
      return parsed.error;
    }

    return jsonOk(getDashboardAiQualityConversationsFixture(parsed.data));
  });
}
