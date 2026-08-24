import { ConnectorDetailPage } from "@/components/integrations/connector-detail-page";

type PageProps = {
  params: Promise<{ type: string; id: string }>;
};

export default async function IntegrationDetailRoute({ params }: PageProps) {
  const { type, id } = await params;
  return <ConnectorDetailPage type={type} connectorId={id} />;
}
