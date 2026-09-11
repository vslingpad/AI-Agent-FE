import { AgentProcedureDetailPage } from "@/components/agents/build/procedures/procedure-detail-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/build/procedures/[procedureId]">) {
  const { agentId, procedureId } = await params;
  return (
    <AgentProcedureDetailPage agentId={agentId} procedureId={procedureId} />
  );
}
