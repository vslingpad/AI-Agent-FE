import { AgentProceduresPage } from "@/components/agents/procedures-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/build/procedures">) {
  const { agentId } = await params;
  return <AgentProceduresPage agentId={agentId} />;
}
