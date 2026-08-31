import { AgentImprovePage } from "@/components/agents/improve/improve-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/improve/duplicate-content">) {
  const { agentId } = await params;
  return <AgentImprovePage agentId={agentId} kind="duplicate-content" />;
}
