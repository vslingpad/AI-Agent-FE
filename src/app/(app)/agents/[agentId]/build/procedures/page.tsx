import { AgentProceduresPage } from "@/components/agents/build/procedures/procedures-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/build/procedures">) {
  const { agentId } = await params;
  return <AgentProceduresPage agentId={agentId} />;
}
