import {
  agentNotFound,
  jsonOk,
  parseJsonBody,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { getAgentSettings, updateAgentSettings } from "@/lib/fixtures/agents-store";
import { UpdateAgentSettingsInputSchema } from "@/lib/schemas/agents";

export async function GET(_request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const settings = getAgentSettings(orgId, agentId);

    if (!settings) {
      return agentNotFound();
    }

    return jsonOk(settings);
  });
}

export async function PATCH(request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const parsed = await parseJsonBody(request, UpdateAgentSettingsInputSchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    const settings = updateAgentSettings(orgId, agentId, parsed.data.settings);

    if (!settings) {
      return agentNotFound();
    }

    return jsonOk(settings);
  });
}
