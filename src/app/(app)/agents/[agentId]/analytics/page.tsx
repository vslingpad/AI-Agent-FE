import { Suspense } from "react";
import { AgentAnalyticsPage } from "@/components/agents/analytics/analytics-page";
import { AgentAnalyticsSkeleton } from "@/components/agents/agent-states";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/analytics">) {
  const { agentId } = await params;
  return (
    <Suspense fallback={<AgentAnalyticsSkeleton />}>
      <AgentAnalyticsPage agentId={agentId} />
    </Suspense>
  );
}
