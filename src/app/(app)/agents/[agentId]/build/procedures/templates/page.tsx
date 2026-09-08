import { ProcedureTemplatesPage } from "@/components/agents/build/procedures/procedure-templates-page";

export default async function Page({
  params,
}: PageProps<"/agents/[agentId]/build/procedures/templates">) {
  const { agentId } = await params;
  return <ProcedureTemplatesPage agentId={agentId} />;
}
