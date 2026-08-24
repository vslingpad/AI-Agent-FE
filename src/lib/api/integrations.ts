import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  ConnectSessionSchema,
  ConnectorDetailSchema,
  CreateConnectorInputSchema,
  IntegrationsHubSchema,
  OrgConnectorSchema,
  UpdateConnectorInputSchema,
  type ConnectSession,
  type ConnectorDetail,
  type CreateConnectorInput,
  type IntegrationsHub,
  type OrgConnector,
  type UpdateConnectorInput,
} from "@/lib/schemas/integrations";

export async function getIntegrationsHub(): Promise<IntegrationsHub> {
  const json = await apiGet<unknown>("/api/integrations");
  return IntegrationsHubSchema.parse(json);
}

export async function getConnectorDetail(id: string): Promise<ConnectorDetail> {
  const json = await apiGet<unknown>(`/api/integrations/${id}`);
  return ConnectorDetailSchema.parse(json);
}

/** @deprecated Use getConnectorDetail */
export async function getOrgConnector(id: string): Promise<OrgConnector> {
  return getConnectorDetail(id);
}

export async function createOrgConnector(
  input: CreateConnectorInput
): Promise<{ connector: OrgConnector; session: ConnectSession }> {
  const parsed = CreateConnectorInputSchema.parse(input);
  const json = await apiPost<unknown>("/api/integrations", parsed);

  return {
    connector: OrgConnectorSchema.parse(
      (json as { connector: unknown }).connector
    ),
    session: ConnectSessionSchema.parse(
      (json as { session: unknown }).session
    ),
  };
}

export async function updateOrgConnector(
  id: string,
  input: UpdateConnectorInput
): Promise<OrgConnector> {
  const parsed = UpdateConnectorInputSchema.parse(input);
  const json = await apiPatch<unknown>(`/api/integrations/${id}`, parsed);
  return OrgConnectorSchema.parse(json);
}

export async function deleteOrgConnector(id: string): Promise<void> {
  await apiDelete(`/api/integrations/${id}`);
}

export async function completeOAuthStep(
  connectorId: string,
  connectSessionId: string,
  stepId: string
): Promise<{ connector: OrgConnector; session: ConnectSession }> {
  const json = await apiPost<unknown>(
    `/api/integrations/${connectorId}/oauth`,
    { connectSessionId, stepId }
  );

  return {
    connector: OrgConnectorSchema.parse(
      (json as { connector: unknown }).connector
    ),
    session: ConnectSessionSchema.parse(
      (json as { session: unknown }).session
    ),
  };
}

export async function startReauth(
  connectorId: string
): Promise<ConnectSession> {
  const json = await apiPost<unknown>(
    `/api/integrations/${connectorId}/reauth`
  );
  return ConnectSessionSchema.parse(json);
}

export async function startOAuthStep(
  connectorId: string,
  stepId: "global_auth" | "sunshine"
): Promise<ConnectSession> {
  const json = await apiPost<unknown>(
    `/api/integrations/${connectorId}/oauth/start`,
    { stepId }
  );
  return ConnectSessionSchema.parse(json);
}

export async function getConnectStatus(
  connectorId: string,
  connectSessionId: string
): Promise<ConnectSession> {
  const json = await apiGet<unknown>(
    `/api/integrations/${connectorId}/connect-status`,
    { connectSessionId }
  );
  return ConnectSessionSchema.parse(json);
}
