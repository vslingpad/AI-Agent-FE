import { AgentHelpDeskPage } from "@/components/agents/help-desk-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/deploy/help-desk">) {
  const { agentId } = await params;
  return <AgentHelpDeskPage agentId={agentId} />;
}
