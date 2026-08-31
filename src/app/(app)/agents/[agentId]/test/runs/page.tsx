import { AgentTestRunsPage } from "@/components/agents/test/runs/test-runs-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/test/runs">) {
  const { agentId } = await params;
  return <AgentTestRunsPage agentId={agentId} />;
}
