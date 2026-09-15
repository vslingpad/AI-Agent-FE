import { AgentKnowledgeGapPage } from "@/components/agents/improve/knowledge-gap-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/improve/knowledge-gap">) {
  const { agentId } = await params;
  return <AgentKnowledgeGapPage agentId={agentId} />;
}
