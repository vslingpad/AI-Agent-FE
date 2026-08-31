import { AgentWebChatPage } from "@/components/agents/web-chat-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/deploy/web-chat">) {
  const { agentId } = await params;
  return <AgentWebChatPage agentId={agentId} />;
}
