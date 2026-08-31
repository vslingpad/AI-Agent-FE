import { AgentAnalyticsPage } from "@/components/agents/analytics/analytics-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/analytics">) {
  const { agentId } = await params;
  return <AgentAnalyticsPage agentId={agentId} />;
}
