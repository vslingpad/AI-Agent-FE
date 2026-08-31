import { AgentActionsPage } from "@/components/agents/actions-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/build/actions">) {
  const { agentId } = await params;
  return <AgentActionsPage agentId={agentId} />;
}
