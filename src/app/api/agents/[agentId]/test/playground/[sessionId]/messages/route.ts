import {
  agentNotFound,
  jsonOk,
  parseJsonBody,
  withAgentId,
} from "@/lib/api/agent-routes";
import { sendPlaygroundMessage } from "@/lib/fixtures/agents-store";
import { SendPlaygroundMessageInputSchema } from "@/lib/schemas/agents";

type PlaygroundMessagesRouteContext = {
  params: Promise<{ agentId: string; sessionId: string }>;
};

export async function POST(request: Request, context: PlaygroundMessagesRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const { sessionId } = await context.params;
    const parsed = await parseJsonBody(request, SendPlaygroundMessageInputSchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    const result = sendPlaygroundMessage(
      orgId,
      agentId,
      sessionId,
      parsed.data.content
    );

    if (!result) {
      return agentNotFound();
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    return jsonOk(result);
  });
}
