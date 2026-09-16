import { getIntegrationsHub } from "@/lib/fixtures/integrations-store";
import type { AgentWorkspace } from "@/lib/schemas/agents";
import type { OrgConnector } from "@/lib/schemas/integrations";
import { getDeployChannelDefinitions } from "./channels-catalog";

export type DeployChannelStatus =
  | "active"
  | "not_connected"
  | "reauth_required"
  | "coming_soon";

export type DeployChannel = {
  id: string;
  label: string;
  description: string;
  iconSlug: string;
  enabled: boolean;
  status: DeployChannelStatus;
  connectorId: string | null;
  connectSlug: string | null;
  available: boolean;
};

function findChannelConnector(connectors: OrgConnector[], slug: string) {
  return (
    connectors.find(
      (connector) =>
        connector.integration_slug === slug &&
        connector.capabilities.includes("channel") &&
        connector.enabled_capabilities.includes("channel")
    ) ?? null
  );
}

function resolveConnectorStatus(connector: OrgConnector | null): DeployChannelStatus {
  if (!connector) {
    return "not_connected";
  }

  if (connector.reauth_required || connector.status === "reauth_required") {
    return "reauth_required";
  }

  if (connector.status === "active") {
    return "active";
  }

  return "not_connected";
}

function mapHelpDeskStatus(
  status: AgentWorkspace["helpDesk"]["status"]
): DeployChannelStatus {
  if (status === "active") {
    return "active";
  }

  if (status === "reauth_required") {
    return "reauth_required";
  }

  return "not_connected";
}

export function isDeployChannelConnected(channel: DeployChannel) {
  return channel.status === "active" || channel.status === "reauth_required";
}

export function countEnabledDeployChannels(agent: AgentWorkspace) {
  let count = 0;

  if (agent.helpDesk.useChannel) {
    count += 1;
  }

  for (const enabled of Object.values(agent.deployChannels ?? {})) {
    if (enabled) {
      count += 1;
    }
  }

  return count;
}

export function buildDeployChannels(
  orgId: string,
  agent: AgentWorkspace
): DeployChannel[] {
  const { connectors } = getIntegrationsHub(orgId);

  return getDeployChannelDefinitions().map((definition) => {
    if (!definition.available) {
      return {
        ...definition,
        enabled: false,
        status: "coming_soon",
        connectorId: null,
      };
    }

    if (definition.id === "zendesk") {
      const connector = findChannelConnector(connectors, "zendesk");

      return {
        ...definition,
        enabled: agent.helpDesk.useChannel,
        status:
          agent.helpDesk.slug === "zendesk"
            ? mapHelpDeskStatus(agent.helpDesk.status)
            : resolveConnectorStatus(connector),
        connectorId: agent.helpDesk.connectorId ?? connector?.id ?? null,
      };
    }

    const connector = definition.connectSlug
      ? findChannelConnector(connectors, definition.connectSlug)
      : null;

    return {
      ...definition,
      enabled: agent.deployChannels?.[definition.id] ?? false,
      status: resolveConnectorStatus(connector),
      connectorId: connector?.id ?? null,
    };
  });
}
