import { apiError } from "@/lib/api/auth";
import { ImproveKindSchema } from "@/lib/schemas/agents";
import {
  agentNotFound,
  jsonOk,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { getAgentImprove } from "@/lib/fixtures/agents-store";

export async function GET(request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const kindParam = new URL(request.url).searchParams.get("kind");

    if (kindParam !== null && !ImproveKindSchema.safeParse(kindParam).success) {
      return apiError("Invalid kind");
    }

    const kind = kindParam
      ? ImproveKindSchema.parse(kindParam)
      : undefined;
    const improve = getAgentImprove(orgId, agentId, kind);

    if (!improve) {
      return agentNotFound();
    }

    return jsonOk(improve);
  });
}
