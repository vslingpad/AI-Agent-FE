import { AgentTestCasesPage } from "@/components/agents/test/cases/test-cases-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/test/cases">) {
  const { agentId } = await params;
  return <AgentTestCasesPage agentId={agentId} />;
}
