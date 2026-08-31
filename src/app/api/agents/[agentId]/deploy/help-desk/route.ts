import {
  agentNotFound,
  jsonOk,
  parseJsonBody,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { getAgentHelpDesk, updateAgentHelpDesk } from "@/lib/fixtures/agents-store";
import { UpdateAgentHelpDeskInputSchema } from "@/lib/schemas/agents";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const helpDesk = getAgentHelpDesk(orgId, agentId);

    if (!helpDesk) {
      return agentNotFound();
    }

    return jsonOk(helpDesk);
  });
}

export async function PATCH(request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const parsed = await parseJsonBody(request, UpdateAgentHelpDeskInputSchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    const helpDesk = updateAgentHelpDesk(orgId, agentId, parsed.data);

    if (!helpDesk) {
      return agentNotFound();
    }

    return jsonOk(helpDesk);
  });
}
