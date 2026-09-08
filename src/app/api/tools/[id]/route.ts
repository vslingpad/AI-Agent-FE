import { proxyControlPlane } from "@/lib/api/control-plane";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function proxy(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyControlPlane(request, `/tools/${id}`);
}

export const PATCH = proxy;
export const DELETE = proxy;
