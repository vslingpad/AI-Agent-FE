import { AgentPlaygroundPage } from "@/components/agents/test/playground/playground-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/test/playground">) {
  const { agentId } = await params;
  return <AgentPlaygroundPage agentId={agentId} />;
}
