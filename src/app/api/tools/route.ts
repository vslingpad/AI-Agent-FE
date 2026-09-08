import { proxyControlPlane } from "@/lib/api/control-plane";

export async function GET(request: Request) {
  return proxyControlPlane(request, "/tools");
}

export async function POST(request: Request) {
  return proxyControlPlane(request, "/tools");
}

export async function PATCH(request: Request) {
  return proxyControlPlane(request, "/tools");
}
