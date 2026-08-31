import { AgentConversationsPage } from "@/components/agents/conversations/conversations-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/conversations">) {
  const { agentId } = await params;
  return <AgentConversationsPage agentId={agentId} />;
}
