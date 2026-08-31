import {
  agentNotFound,
  jsonOk,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { getAgentTestCases } from "@/lib/fixtures/agents-store";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const testCases = getAgentTestCases(orgId, agentId);

    if (!testCases) {
      return agentNotFound();
    }

    return jsonOk(testCases);
  });
}
