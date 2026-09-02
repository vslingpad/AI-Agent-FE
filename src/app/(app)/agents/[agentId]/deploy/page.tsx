import type { Metadata } from "next";
import { AgentDeployPage } from "@/components/agents/deploy/deploy-page";

type AgentDeployRouteProps = {
  params: Promise<{ agentId: string }>;
};

export const metadata: Metadata = {
  title: "Deploy",
};

export default async function Page({ params }: AgentDeployRouteProps) {
  const { agentId } = await params;

  return <AgentDeployPage agentId={agentId} />;
}
