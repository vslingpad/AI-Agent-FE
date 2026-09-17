"use client";

import { useOrganization } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { KNOWLEDGE_SUB_CAPABILITY_LABELS } from "@/components/integrations/integration-utils";
import {
  formatConnectedByLine,
  formatConnectedDate,
} from "@/lib/integrations/connector-paths";
import { getZendeskAuthStatus } from "@/lib/integrations/zendesk-auth";
import { Badge } from "@/components/ui/badge";
import type {
  ConnectorCapability,
  ConnectorDetail,
  IntegrationCatalogItem,
  KnowledgeSubCapability,
} from "@/lib/schemas/integrations";

type OverviewTabProps = {
  connector: ConnectorDetail;
  catalogItem: IntegrationCatalogItem | undefined;
  enabled_capabilities: ConnectorCapability[];
  enabled_knowledge_sub_capabilities: KnowledgeSubCapability[];
  onToggleCapability: (capability: ConnectorCapability) => void;
  onToggleKnowledgeSubCapability: (capability: KnowledgeSubCapability) => void;
};

export function OverviewTab({
  connector,
  catalogItem,
  enabled_capabilities,
  enabled_knowledge_sub_capabilities,
  onToggleCapability,
  onToggleKnowledgeSubCapability,
}: OverviewTabProps) {
  const { membership } = useOrganization();
  const isAdmin = membership?.role === "org:admin";

  return (
    <div className="grid w-full max-w-6xl gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Capabilities</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enable what this connection provides to your organization. Agents
            opt in per binding.
          </p>
        </CardHeader>
        <CardContent className="gap-0 space-y-4">
          {catalogItem?.capabilities.map((capability) => {
            const enabled = enabled_capabilities.includes(capability);
            const knowledgeSubs =
              capability === "knowledge"
                ? catalogItem.knowledge_sub_capabilities ?? []
                : [];

            return (
              <div key={capability} className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <Label htmlFor={`cap-${capability}`} className="capitalize">
                    {capability}
                  </Label>
                  <Switch
                    id={`cap-${capability}`}
                    checked={enabled}
                    disabled={!isAdmin}
                    onCheckedChange={() => onToggleCapability(capability)}
                  />
                </div>

                {knowledgeSubs.length > 0 ? (
                  <div className="ml-4 space-y-2 border-l border-border pl-4">
                    {knowledgeSubs.map((subCapability) => {
                      const subEnabled =
                        enabled &&
                        enabled_knowledge_sub_capabilities.includes(subCapability);

                      return (
                        <div
                          key={subCapability}
                          className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5"
                        >
                          <Label
                            htmlFor={`knowledge-sub-${subCapability}`}
                            className="text-sm font-normal"
                          >
                            {KNOWLEDGE_SUB_CAPABILITY_LABELS[subCapability]}
                          </Label>
                          <Switch
                            id={`knowledge-sub-${subCapability}`}
                            checked={subEnabled}
                            disabled={!isAdmin || !enabled}
                            onCheckedChange={() =>
                              onToggleKnowledgeSubCapability(subCapability)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Display name" value={connector.display_name} />
          <DetailRow label="Account" value={connector.identifier} />
          <DetailRow
            label={
              connector.connected_by.name.trim()
                ? "Connected by"
                : "Connected on"
            }
            value={
              connector.connected_by.name.trim()
                ? formatConnectedByLine(
                    connector.connected_by.name,
                    connector.connected_by.connected_at
                  )
                : formatConnectedDate(connector.connected_by.connected_at)
            }
          />
          <DetailRow
            label="Status"
            value={connector.status.replaceAll("_", " ")}
          />
          {connector.external_instance_id && (
            <DetailRow
              label="Instance ID"
              value={connector.external_instance_id}
              mono
            />
          )}
          {(connector.integration_slug === "stripe" ||
            connector.integration_slug === "stripe_subscriptions") && (
            <DetailRow
              label="Environment"
              value={String(connector.config.mode ?? "live")}
            />
          )}
          {connector.integration_slug === "zendesk" && (
            <>
              <DetailRow
                label="Sunshine auth"
                value={
                  getZendeskAuthStatus(connector.config).sunshine
                    ? "Connected"
                    : "Not connected"
                }
              />
              <DetailRow
                label="Global Auth"
                value={
                  getZendeskAuthStatus(connector.config).globalAuth
                    ? "Connected"
                    : "Required for Knowledge & Actions"
                }
              />
            </>
          )}
        </CardContent>
      </Card>

      {connector.integration_slug === "zendesk" &&
        !getZendeskAuthStatus(connector.config).globalAuth && (
          <Card className="lg:col-span-2">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-medium">
                  Support &amp; Guide authorization
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enable Knowledge or Actions to authorize Zendesk Global Auth.
                </p>
              </div>
              <Badge variant="warning">Not authorized</Badge>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm font-medium ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
