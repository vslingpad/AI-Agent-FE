import {
  adaptConnectorPayload,
  keysToSnake,
  proxyControlPlane,
} from "@/lib/api/control-plane";

export async function GET(request: Request) {
  return proxyControlPlane(request, "/orgs/me/connectors", {
    transformJson: adaptConnectorPayload,
  });
}

export async function POST(request: Request) {
  return proxyControlPlane(request, "/orgs/me/connectors", {
    rewriteBody: keysToSnake,
    transformJson: adaptConnectorPayload,
  });
}
