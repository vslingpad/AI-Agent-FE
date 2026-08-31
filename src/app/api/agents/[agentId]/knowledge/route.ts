import {
  agentNotFound,
  jsonOk,
  parseJsonBody,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { getAgentKnowledge, updateAgentKnowledge } from "@/lib/fixtures/agents-store";
import { UpdateAgentKnowledgeInputSchema } from "@/lib/schemas/agents";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const knowledge = getAgentKnowledge(orgId, agentId);

    if (!knowledge) {
      return agentNotFound();
    }

    return jsonOk(knowledge);
  });
}

export async function PATCH(request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const parsed = await parseJsonBody(request, UpdateAgentKnowledgeInputSchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    const knowledge = updateAgentKnowledge(orgId, agentId, parsed.data);

    if (!knowledge) {
      return agentNotFound();
    }

    return jsonOk(knowledge);
  });
}
