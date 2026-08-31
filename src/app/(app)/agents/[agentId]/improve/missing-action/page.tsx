import { AgentImprovePage } from "@/components/agents/improve/improve-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/improve/missing-action">) {
  const { agentId } = await params;
  return <AgentImprovePage agentId={agentId} kind="missing-action" />;
}
