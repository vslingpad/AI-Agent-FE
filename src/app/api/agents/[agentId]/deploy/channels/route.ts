import {
  agentNotFound,
  jsonOk,
  parseJsonBody,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import {
  getAgentDeployChannels,
  updateAgentDeployChannel,
} from "@/lib/fixtures/agents-store";
import { UpdateAgentDeployChannelInputSchema } from "@/lib/schemas/agents";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const channels = getAgentDeployChannels(orgId, agentId);

    if (!channels) {
      return agentNotFound();
    }

    return jsonOk(channels);
  });
}

export async function PATCH(request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const parsed = await parseJsonBody(request, UpdateAgentDeployChannelInputSchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    const channels = updateAgentDeployChannel(orgId, agentId, parsed.data);

    if (!channels) {
      return agentNotFound();
    }

    return jsonOk(channels);
  });
}
