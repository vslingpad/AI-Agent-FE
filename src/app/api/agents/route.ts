import { jsonOk, parseJsonBody, withAgentOrg } from "@/lib/api/agent-routes";
import { createAgent, getAgentsList } from "@/lib/fixtures/agents-store";
import { CreateAgentInputSchema } from "@/lib/schemas/agents";

export async function GET() {
  return withAgentOrg(async (orgId) => {
    await new Promise((resolve) => setTimeout(resolve, 180));
    return jsonOk(getAgentsList(orgId));
  });
}

export async function POST(request: Request) {
  return withAgentOrg(async (orgId) => {
    const parsed = await parseJsonBody(request, CreateAgentInputSchema);

    if ("error" in parsed) {
      return parsed.error;
    }

    const agent = createAgent(orgId, parsed.data);
    return jsonOk(agent, { status: 201 });
  });
}
