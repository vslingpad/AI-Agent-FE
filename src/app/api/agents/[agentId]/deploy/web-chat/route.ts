import {
  agentNotFound,
  jsonOk,
  parseJsonBody,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { getAgentWebChat, updateAgentWebChat } from "@/lib/fixtures/agents-store";
import { UpdateAgentWebChatInputSchema } from "@/lib/schemas/agents";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const webChat = getAgentWebChat(orgId, agentId);

    if (!webChat) {
      return agentNotFound();
    }

    return jsonOk(webChat);
  });
}

export async function PATCH(request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const parsed = await parseJsonBody(request, UpdateAgentWebChatInputSchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    const webChat = updateAgentWebChat(orgId, agentId, parsed.data.webChat);

    if (!webChat) {
      return agentNotFound();
    }

    return jsonOk(webChat);
  });
}
