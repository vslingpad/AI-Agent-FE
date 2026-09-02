import {
  agentNotFound,
  jsonOk,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { getAgentConversationLocations } from "@/lib/fixtures/agents-store";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const locations = getAgentConversationLocations(orgId, agentId);

    if (!locations) {
      return agentNotFound();
    }

    return jsonOk(locations);
  });
}
