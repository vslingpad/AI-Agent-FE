import { Suspense } from "react";
import { AgentConversationsPage } from "@/components/agents/conversations/conversations-page";
import { AgentConversationsSkeleton } from "@/components/agents/agent-states";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/conversations">) {
  const { agentId } = await params;

  return (
    <Suspense fallback={<AgentConversationsSkeleton />}>
      <AgentConversationsPage agentId={agentId} />
    </Suspense>
  );
}
