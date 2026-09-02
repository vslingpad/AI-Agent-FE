"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentDeploySkeleton, AgentErrorState } from "@/components/agents/agent-states";
import { ConnectChannelRow } from "@/components/agents/deploy/connect-channel-row";
import type { DeployChannelTile } from "@/components/agents/deploy/connect-channel-tile";
import {
  ShowAllChannelsDialog,
  buildDeployChannelTiles,
} from "@/components/agents/deploy/show-all-channels-dialog";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useAgentDeployChannels,
  useUpdateAgentDeployChannel,
} from "@/hooks/use-agents";
import { useIntegrationsHub } from "@/hooks/use-integrations";
import { hasChannelCapability } from "@/lib/deploy/channel-utils";
import { EXTRA_DEPLOY_CHANNELS } from "@/lib/deploy/channels-catalog";
import { isDeployChannelConnected } from "@/lib/deploy/deploy-channels";
import { getConnectorPath } from "@/lib/integrations/connector-paths";
import type { DeployChannel } from "@/lib/schemas/agents";

export function AgentDeployPage({ agentId }: { agentId: string }) {
  const { data, isLoading, isError, refetch } = useAgentDeployChannels(agentId);
  const {
    data: hub,
    isLoading: hubLoading,
    isError: hubError,
    refetch: refetchHub,
  } = useIntegrationsHub();
  const updateChannel = useUpdateAgentDeployChannel(agentId);
  const [showAllOpen, setShowAllOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const channelCatalog = useMemo(
    () =>
      (hub?.catalog ?? [])
        .filter((item) => hasChannelCapability(item.capabilities))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [hub]
  );

  const channelTiles = useMemo(
    () => buildDeployChannelTiles(channelCatalog, EXTRA_DEPLOY_CHANNELS),
    [channelCatalog]
  );

  const filteredTiles = useMemo(
    () => filterChannelTiles(channelTiles, searchQuery),
    [channelTiles, searchQuery]
  );

  const connectedChannels = useMemo(
    () => (data?.channels ?? []).filter(isDeployChannelConnected),
    [data]
  );

  const filteredConnected = useMemo(
    () => filterConnectedChannels(connectedChannels, searchQuery),
    [connectedChannels, searchQuery]
  );

  const isSearching = Boolean(searchQuery.trim());

  if (isLoading || hubLoading) {
    return <AgentDeploySkeleton />;
  }

  if (isError || hubError || !data || !hub) {
    return (
      <AgentErrorState
        message="Unable to load deploy channels."
        onRetry={() => {
          void refetch();
          void refetchHub();
        }}
      />
    );
  }

  return (
    <AgentPageFrame
      title="Deploy"
      description="Enable conversation channels for this agent. Connect integrations at the organization level first."
      actions={
        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search channels…"
            className="h-9 pl-8"
            aria-label="Search channels"
          />
        </div>
      }
    >
      <section className="space-y-3">
        <h2 className="text-sm font-medium">Connect a channel</h2>
        {isSearching && filteredTiles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No channels match “{searchQuery.trim()}”.
            </p>
          </div>
        ) : (
          <ConnectChannelRow
            tiles={filteredTiles}
            isSearching={isSearching}
            onShowAll={() => setShowAllOpen(true)}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Connected channels</h2>
        {connectedChannels.length === 0 ? (
          <div className="flex max-w-5xl flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm font-medium">No connected channels yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect a channel above, then enable it for this agent.
            </p>
          </div>
        ) : filteredConnected.length === 0 ? (
          <div className="flex max-w-5xl flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm font-medium">No connected channels found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different channel name or integration.
            </p>
          </div>
        ) : (
          <div className="grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredConnected.map((channel) => (
              <ConnectedDeployChannelCard
                key={channel.id}
                channel={channel}
                pending={updateChannel.isPending}
                onToggle={(enabled) =>
                  updateChannel.mutate({ channelId: channel.id, enabled })
                }
              />
            ))}
          </div>
        )}
      </section>

      <ShowAllChannelsDialog
        catalog={channelCatalog}
        extraChannels={EXTRA_DEPLOY_CHANNELS}
        open={showAllOpen}
        onOpenChange={setShowAllOpen}
      />
    </AgentPageFrame>
  );
}

function ConnectedDeployChannelCard({
  channel,
  pending,
  onToggle,
}: {
  channel: DeployChannel;
  pending: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  const canToggle = channel.status === "active";

  return (
    <Card className="h-full border-border bg-background">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <IntegrationBrandIcon slug={channel.iconSlug} />
          <div
            className="flex shrink-0 items-center gap-2"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Label htmlFor={`deploy-channel-${channel.id}`} className="sr-only">
              Enable {channel.label}
            </Label>
            <Switch
              id={`deploy-channel-${channel.id}`}
              checked={channel.enabled}
              disabled={pending || !canToggle}
              onCheckedChange={onToggle}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-base font-semibold leading-tight">{channel.label}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {channel.description}
          </p>
          {channel.status === "reauth_required" &&
          channel.connectorId &&
          channel.connectSlug ? (
            <Link
              href={getConnectorPath(channel.connectSlug, channel.connectorId)}
              className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Reconnect integration
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function matchesQuery(query: string, values: Array<string | null | undefined>) {
  if (!query.trim()) {
    return true;
  }

  const normalized = query.trim().toLowerCase();

  return values.some((value) => value?.toLowerCase().includes(normalized));
}

function filterChannelTiles(tiles: DeployChannelTile[], query: string) {
  return tiles.filter((tile) => {
    if (tile.kind === "catalog") {
      return matchesQuery(query, [
        tile.item.name,
        tile.item.description,
        tile.item.slug,
      ]);
    }

    return matchesQuery(query, [
      tile.channel.label,
      tile.channel.description,
      tile.channel.iconSlug,
      tile.channel.id,
    ]);
  });
}

function filterConnectedChannels(channels: DeployChannel[], query: string) {
  return channels.filter((channel) =>
    matchesQuery(query, [
      channel.label,
      channel.description,
      channel.iconSlug,
      channel.id,
      channel.connectSlug,
    ])
  );
}
