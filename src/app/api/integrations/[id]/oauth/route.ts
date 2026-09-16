import { NextResponse } from "next/server";
import { apiError, requireOrgId } from "@/lib/api/auth";
import {
  adaptConnectorPayload,
  ControlPlaneAuthError,
  controlPlaneFetch,
  detailToError,
  isPlainObject,
  jsonFromResponse,
} from "@/lib/api/control-plane";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function backendError(status: number, body: unknown) {
  if (isPlainObject(body) && "detail" in body) {
    return apiError(detailToError(body.detail), status);
  }

  return apiError("Request failed", status);
}

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireOrgId();

  if ("error" in authResult) {
    return authResult.error;
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    connect_session_id?: string;
  } | null;
  const connectSessionId = body?.connect_session_id;
  const query = connectSessionId
    ? `?connect_session_id=${encodeURIComponent(connectSessionId)}`
    : "";

  try {
    const [sessionResponse, connectorResponse] = await Promise.all([
      controlPlaneFetch(`/orgs/me/connectors/${id}/connect-status${query}`),
      controlPlaneFetch(`/orgs/me/connectors/${id}`),
    ]);

    const sessionPayload = await jsonFromResponse(sessionResponse);
    if (!sessionResponse.ok) {
      return backendError(sessionResponse.status, sessionPayload);
    }

    const connectorPayload = await jsonFromResponse(connectorResponse);
    if (!connectorResponse.ok) {
      return backendError(connectorResponse.status, connectorPayload);
    }

    return NextResponse.json({
      connector: adaptConnectorPayload(connectorPayload),
      session: adaptConnectorPayload(sessionPayload),
    });
  } catch (error) {
    if (error instanceof ControlPlaneAuthError) {
      return apiError("Unauthorized", 401);
    }

    console.error("Connect status verify failed", error);
    return apiError("Control plane unavailable", 502);
  }
}
