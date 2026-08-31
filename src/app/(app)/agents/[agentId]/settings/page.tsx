import { AgentSettingsPage } from "@/components/agents/settings/settings-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/settings">) {
  const { agentId } = await params;
  return <AgentSettingsPage agentId={agentId} />;
}
