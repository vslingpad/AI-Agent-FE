import {
  agentNotFound,
  jsonOk,
  parseJsonBody,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import {
  deleteAgent,
  getAgentCore,
  updateAgentCore,
} from "@/lib/fixtures/agents-store";
import { UpdateAgentCoreInputSchema } from "@/lib/schemas/agents";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const core = getAgentCore(orgId, agentId);

    if (!core) {
      return agentNotFound();
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
    return jsonOk(core);
  });
}

export async function PATCH(request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const parsed = await parseJsonBody(request, UpdateAgentCoreInputSchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    const core = updateAgentCore(orgId, agentId, parsed.data);

    if (!core) {
      return agentNotFound();
    }

    return jsonOk(core);
  });
}

export async function DELETE(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const deleted = deleteAgent(orgId, agentId);

    if (!deleted) {
      return agentNotFound();
    }

    return jsonOk({ ok: true });
  });
}
