import { proxyControlPlane } from "@/lib/api/control-plane";

export async function GET(request: Request) {
  return proxyControlPlane(request, "/dashboard/ai-quality");
}
