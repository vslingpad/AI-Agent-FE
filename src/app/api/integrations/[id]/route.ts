import {
  adaptConnectorPayload,
  keysToSnake,
  proxyControlPlane,
} from "@/lib/api/control-plane";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyControlPlane(request, `/orgs/me/connectors/${id}`, {
    transformJson: adaptConnectorPayload,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyControlPlane(request, `/orgs/me/connectors/${id}`, {
    rewriteBody: keysToSnake,
    transformJson: adaptConnectorPayload,
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyControlPlane(request, `/orgs/me/connectors/${id}`);
}
