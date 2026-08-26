import { ConnectorDetailPage } from "@/components/integrations/connector-detail-page";

type PageProps = {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function IntegrationDetailRoute({
  params,
  searchParams,
}: PageProps) {
  const { type, id } = await params;
  const { tab } = await searchParams;
  return (
    <ConnectorDetailPage type={type} connectorId={id} initialTab={tab} />
  );
}
