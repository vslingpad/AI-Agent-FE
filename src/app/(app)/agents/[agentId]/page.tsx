import { redirect } from "next/navigation";
import { agentPath } from "@/lib/navigation/agent-sections";

export default async function AgentIndexPage({
  params,
}: PageProps<"/agents/[agentId]">) {
  const { agentId } = await params;
  redirect(agentPath(agentId, "analytics"));
}
