import { proxyControlPlane } from "@/lib/api/control-plane";

export async function GET(request: Request) {
  return proxyControlPlane(request, "/agents");
}

export async function POST(request: Request) {
  return proxyControlPlane(request, "/agents");
}
