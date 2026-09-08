import { proxyControlPlane } from "@/lib/api/control-plane";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const suffix = path.length ? `/${path.join("/")}` : "";
  return proxyControlPlane(request, `/agents${suffix}`);
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
