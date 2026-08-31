import {
  agentNotFound,
  jsonOk,
  parseJsonBody,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { getAgentActions, updateAgentActions } from "@/lib/fixtures/agents-store";
import { UpdateAgentActionsInputSchema } from "@/lib/schemas/agents";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const actions = getAgentActions(orgId, agentId);

    if (!actions) {
      return agentNotFound();
    }

    return jsonOk(actions);
  });
}

export async function PATCH(request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const parsed = await parseJsonBody(request, UpdateAgentActionsInputSchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    const actions = updateAgentActions(orgId, agentId, parsed.data);

    if (!actions) {
      return agentNotFound();
    }

    return jsonOk(actions);
  });
}
