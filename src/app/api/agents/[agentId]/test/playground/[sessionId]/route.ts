import {
  agentNotFound,
  jsonOk,
  parseJsonBody,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import {
  getPlaygroundSession,
  updatePlaygroundSession,
} from "@/lib/fixtures/agents-store";
import { UpdatePlaygroundSessionInputSchema } from "@/lib/schemas/agents";

type PlaygroundSessionRouteContext = {
  params: Promise<{ agentId: string; sessionId: string }>;
};

export async function GET(_request: Request, context: PlaygroundSessionRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const { sessionId } = await context.params;
    const session = getPlaygroundSession(orgId, agentId, sessionId);

    if (!session) {
      return agentNotFound();
    }

    return jsonOk(session);
  });
}

export async function PATCH(request: Request, context: PlaygroundSessionRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const { sessionId } = await context.params;
    const parsed = await parseJsonBody(request, UpdatePlaygroundSessionInputSchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    const session = updatePlaygroundSession(orgId, agentId, sessionId, parsed.data);

    if (!session) {
      return agentNotFound();
    }

    return jsonOk(session);
  });
}
