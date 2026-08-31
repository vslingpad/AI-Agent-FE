import {
  agentNotFound,
  jsonOk,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { getAgentConversations } from "@/lib/fixtures/agents-store";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const conversations = getAgentConversations(orgId, agentId);

    if (!conversations) {
      return agentNotFound();
    }

    return jsonOk(conversations);
  });
}
