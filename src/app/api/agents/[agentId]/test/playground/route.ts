import {
  agentNotFound,
  jsonOk,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { createPlaygroundSession } from "@/lib/fixtures/agents-store";

export async function POST(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const session = createPlaygroundSession(orgId, agentId);

    if (!session) {
      return agentNotFound();
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
    return jsonOk(session, { status: 201 });
  });
}
