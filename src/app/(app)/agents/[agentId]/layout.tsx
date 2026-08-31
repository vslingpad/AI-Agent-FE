import { AgentWorkspaceShell } from "@/components/agents/agent-workspace-shell";

export default async function AgentLayout({
  children,
  params,
}: LayoutProps<"/agents/[agentId]">) {
  const { agentId } = await params;

  return (
    <AgentWorkspaceShell agentId={agentId}>{children}</AgentWorkspaceShell>
  );
}
