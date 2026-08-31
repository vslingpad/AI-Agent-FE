import {
  agentNotFound,
  jsonOk,
  parseJsonBody,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { getAgentProcedures, updateAgentProcedures } from "@/lib/fixtures/agents-store";
import { UpdateAgentProceduresInputSchema } from "@/lib/schemas/agents";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const procedures = getAgentProcedures(orgId, agentId);

    if (!procedures) {
      return agentNotFound();
    }

    return jsonOk(procedures);
  });
}

export async function PATCH(request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const parsed = await parseJsonBody(request, UpdateAgentProceduresInputSchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    const procedures = updateAgentProcedures(orgId, agentId, parsed.data);

    if (!procedures) {
      return agentNotFound();
    }

    return jsonOk(procedures);
  });
}
