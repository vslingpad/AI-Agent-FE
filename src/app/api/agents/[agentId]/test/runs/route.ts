import {
  agentNotFound,
  jsonOk,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { getAgentTestRuns } from "@/lib/fixtures/agents-store";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const testRuns = getAgentTestRuns(orgId, agentId);

    if (!testRuns) {
      return agentNotFound();
    }

    return jsonOk(testRuns);
  });
}
