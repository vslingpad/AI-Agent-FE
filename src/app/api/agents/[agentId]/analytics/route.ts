import {
  agentNotFound,
  jsonOk,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { getAgentAnalytics } from "@/lib/fixtures/agents-store";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const analytics = getAgentAnalytics(orgId, agentId);

    if (!analytics) {
      return agentNotFound();
    }

    await new Promise((resolve) => setTimeout(resolve, 140));
    return jsonOk(analytics);
  });
}
