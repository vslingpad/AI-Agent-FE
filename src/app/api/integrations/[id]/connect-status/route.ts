import { adaptConnectorPayload, proxyControlPlane } from "@/lib/api/control-plane";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyControlPlane(
    request,
    `/orgs/me/connectors/${id}/connect-status`,
    {
      transformJson: adaptConnectorPayload,
    }
  );
}
