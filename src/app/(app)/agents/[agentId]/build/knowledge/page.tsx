import { AgentKnowledgePage } from "@/components/agents/build/knowledge/knowledge-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/build/knowledge">) {
  const { agentId } = await params;
  return <AgentKnowledgePage agentId={agentId} />;
}
