import { AgentImprovePage } from "@/components/agents/improve-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/improve/missing-procedure">) {
  const { agentId } = await params;
  return <AgentImprovePage agentId={agentId} kind="missing-procedure" />;
}
