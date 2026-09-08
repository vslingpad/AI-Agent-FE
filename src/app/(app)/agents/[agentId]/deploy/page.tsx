import { AgentDeployPage } from "@/components/agents/deploy/deploy-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/deploy">) {
  const { agentId } = await params;
  return <AgentDeployPage agentId={agentId} />;
}
