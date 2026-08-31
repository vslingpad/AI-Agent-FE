import {
  agentNotFound,
  jsonOk,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { getAgentPlayground } from "@/lib/fixtures/agents-store";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const playground = getAgentPlayground(orgId, agentId);

    if (!playground) {
      return agentNotFound();
    }

    return jsonOk(playground);
  });
}
