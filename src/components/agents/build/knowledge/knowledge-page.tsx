"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Show } from "@clerk/nextjs";
import {
  LayoutGridIcon,
  SearchIcon,
} from "lucide-react";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentErrorState, AgentKnowledgeSkeleton } from "@/components/agents/agent-states";
import { AddKnowledgeFileDialog } from "@/components/agents/build/knowledge/dialogs/add-knowledge-file-dialog";
import { AddKnowledgeQnaDialog } from "@/components/agents/build/knowledge/dialogs/add-knowledge-qna-dialog";
import { AddKnowledgeWebsiteDialog } from "@/components/agents/build/knowledge/dialogs/add-knowledge-website-dialog";
import { ComingSoonDialog } from "@/components/agents/build/knowledge/dialogs/coming-soon-dialog";
import { KnowledgeVendorDialog } from "@/components/agents/build/knowledge/dialogs/knowledge-vendor-dialog";
import { ShowAllKnowledgeDialog } from "@/components/agents/build/knowledge/dialogs/show-all-knowledge-dialog";
import { KnowledgeSourceDetail } from "@/components/agents/build/knowledge/knowledge-source-detail";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAgentKnowledge, useUpdateAgentKnowledge } from "@/hooks/use-agents";
import { formatLastSyncAttempt } from "@/lib/integrations/connector-paths";
import {
  KNOWLEDGE_TILES,
  flattenKnowledgeOptions,
  knowledgeTileMatchesSearch,
  primaryVendor,
  tileSourceId,
  type KnowledgeTile,
} from "@/lib/knowledge/catalog";
import type { KnowledgeOptionKind, KnowledgeSource } from "@/lib/schemas/agents";
import { cn } from "@/lib/utils";

const ROW_TILES = [
  ...KNOWLEDGE_TILES.filter((tile) => tile.available),
  ...KNOWLEDGE_TILES.filter((tile) => !tile.available),
];

const TILE_WIDTH = 148;
const TILE_GAP = 12;
const SHOW_ALL_WIDTH = 148;

type AddDialog = "files" | "website" | "qna" | null;

export function AgentKnowledgePage({ agentId }: { agentId: string }) {
  return <AgentKnowledgePageContent key={agentId} agentId={agentId} />;
}

function AgentKnowledgePageContent({ agentId }: { agentId: string }) {
  const { data: knowledge, isLoading, isError, refetch } = useAgentKnowledge(agentId);
  const updateKnowledge = useUpdateAgentKnowledge(agentId);
  const [viewSourceId, setViewSourceId] = useState<string | null>(null);
  const [showAllOpen, setShowAllOpen] = useState(false);
  const [addDialog, setAddDialog] = useState<AddDialog>(null);
  const [vendorDialogTile, setVendorDialogTile] = useState<KnowledgeTile | null>(null);
  const [comingSoonLabel, setComingSoonLabel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAddTiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return ROW_TILES;
    }

    return ROW_TILES.filter((tile) => knowledgeTileMatchesSearch(tile, searchQuery));
  }, [searchQuery]);

  const connectedSources = useMemo(
    () =>
      (knowledge?.sources ?? []).filter((source) => {
        if (isIntegrationKnowledgeSource(source)) {
          return source.state === "connected";
        }

        return source.enabled;
      }),
    [knowledge]
  );

  const filteredConnectedSources = useMemo(() => {
    if (!searchQuery.trim()) {
      return connectedSources;
    }

    const normalized = searchQuery.trim().toLowerCase();

    return connectedSources.filter((source) =>
      [source.name, source.instanceName, source.slug, source.kind]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized))
    );
  }, [connectedSources, searchQuery]);

  const viewSource = viewSourceId
    ? knowledge?.sources.find((source) => source.id === viewSourceId)
    : null;

  if (isLoading) {
    return <AgentKnowledgeSkeleton />;
  }

  if (isError || !knowledge) {
    return (
      <AgentErrorState message="Unable to load knowledge." onRetry={() => refetch()} />
    );
  }

  if (viewSource && (!isIntegrationKnowledgeSource(viewSource) || viewSource.enabled)) {
    return (
      <KnowledgeSourceDetail
        key={viewSource.id}
        agentId={agentId}
        source={viewSource}
        onBack={() => setViewSourceId(null)}
      />
    );
  }

  const toggleSource = (sourceId: string, enabled: boolean) => {
    updateKnowledge.mutate({
      knowledgeSourceId: sourceId,
      knowledgeEnabled: enabled,
    });
  };

  const handleAddTile = (tile: KnowledgeTile) => {
    if (!tile.available) {
      setComingSoonLabel(tile.label);
      return;
    }

    if (tile.optionKind === "files") {
      setAddDialog("files");
      return;
    }

    if (tile.optionKind === "website") {
      setAddDialog("website");
      return;
    }

    if (tile.optionKind === "qna") {
      setAddDialog("qna");
    }
  };

  const handlePickerTile = (tile: KnowledgeTile) => {
    if (!tile.available) {
      setComingSoonLabel(tile.label);
      return;
    }

    setVendorDialogTile(tile);
  };

  const handleFlattenedSelect = (id: string) => {
    setShowAllOpen(false);
    const tile = KNOWLEDGE_TILES.find((item) => item.id === id);

    if (tile) {
      if (tile.interaction === "add") {
        handleAddTile(tile);
      } else if (tile.interaction === "picker") {
        handlePickerTile(tile);
      } else if (!tile.available) {
        setComingSoonLabel(tile.label);
      } else if (tile.kind === "group") {
        setVendorDialogTile(tile);
      }
      return;
    }

    const option = flattenKnowledgeOptions().find((item) => item.id === id);

    if (!option) {
      return;
    }

    if (!option.available) {
      setComingSoonLabel(option.label);
      return;
    }

    if (option.vendorSlug && option.optionKind) {
      const source = knowledge.sources.find(
        (item) =>
          item.kind === option.optionKind && item.vendorSlug === option.vendorSlug
      );

      if (source && !source.enabled) {
        toggleSource(source.id, true);
      }
    }
  };

  return (
    <AgentPageFrame
      title="Knowledge"
      description="Add sources this agent can retrieve from, then open a connected source to review its resources."
      actions={
        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search knowledge…"
            className="h-9 pl-8"
            aria-label="Search knowledge"
          />
        </div>
      }
    >
      <section className="space-y-3">
        <h2 className="text-sm font-medium">Add knowledge</h2>
        {searchQuery.trim() && filteredAddTiles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No add options match “{searchQuery.trim()}”.
            </p>
          </div>
        ) : (
          <KnowledgeOptionRow
            tiles={filteredAddTiles}
            sources={knowledge.sources}
            pending={updateKnowledge.isPending}
            onAdd={handleAddTile}
            onPicker={handlePickerTile}
            onToggle={toggleSource}
            onComingSoon={setComingSoonLabel}
            onShowAll={() => setShowAllOpen(true)}
            isSearching={Boolean(searchQuery.trim())}
          />
        )}
      </section>

      <section className="space-y-3 max-w-5xl">
        <h2 className="text-sm font-medium">Connected knowledge</h2>
        {connectedSources.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm font-medium">No connected knowledge yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add files, websites, Q&amp;A, or connect an integration above.
            </p>
          </div>
        ) : filteredConnectedSources.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm font-medium">No matches found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different source name or type.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredConnectedSources.map((source) => (
              <ConnectedKnowledgeCard
                key={source.id}
                source={source}
                pending={updateKnowledge.isPending}
                onToggle={(sourceId, enabled) => {
                  toggleSource(sourceId, enabled);
                  if (!enabled && viewSourceId === sourceId) {
                    setViewSourceId(null);
                  }
                }}
                onOpen={() => {
                  if (!isIntegrationKnowledgeSource(source) || source.enabled) {
                    setViewSourceId(source.id);
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      <AddKnowledgeFileDialog
        open={addDialog === "files"}
        onOpenChange={(open) => !open && setAddDialog(null)}
        pending={updateKnowledge.isPending}
        onSubmit={(name) => {
          updateKnowledge.mutate({ addFile: { name } });
          setAddDialog(null);
        }}
      />

      <AddKnowledgeWebsiteDialog
        open={addDialog === "website"}
        onOpenChange={(open) => !open && setAddDialog(null)}
        pending={updateKnowledge.isPending}
        onSubmit={(url) => {
          updateKnowledge.mutate({ addUrl: url });
          setAddDialog(null);
        }}
      />

      <AddKnowledgeQnaDialog
        open={addDialog === "qna"}
        onOpenChange={(open) => !open && setAddDialog(null)}
        pending={updateKnowledge.isPending}
        onSubmit={(input) => updateKnowledge.mutate({ addQna: input })}
      />

      <ShowAllKnowledgeDialog
        open={showAllOpen}
        onOpenChange={setShowAllOpen}
        onSelect={handleFlattenedSelect}
      />

      {vendorDialogTile ? (
        <KnowledgeVendorDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setVendorDialogTile(null);
            }
          }}
          title={vendorDialogTile.label}
          description={
            vendorDialogTile.optionKind === "tickets"
              ? "Choose a helpdesk connector to train this agent on solved tickets."
              : "Sync Help Center articles into this agent."
          }
          optionKind={vendorDialogTile.optionKind!}
          vendors={vendorDialogTile.vendors ?? []}
          sources={knowledge.sources}
        />
      ) : null}

      <ComingSoonDialog
        label={comingSoonLabel}
        onOpenChange={() => setComingSoonLabel(null)}
      />
    </AgentPageFrame>
  );
}

function KnowledgeOptionRow({
  tiles,
  sources,
  pending,
  onAdd,
  onPicker,
  onToggle,
  onComingSoon,
  onShowAll,
  isSearching,
}: {
  tiles: KnowledgeTile[];
  sources: KnowledgeSource[];
  pending: boolean;
  onAdd: (tile: KnowledgeTile) => void;
  onPicker: (tile: KnowledgeTile) => void;
  onToggle: (sourceId: string, enabled: boolean) => void;
  onComingSoon: (label: string) => void;
  onShowAll: () => void;
  isSearching: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    if (isSearching) {
      return;
    }

    const node = rowRef.current;

    if (!node) {
      return;
    }

    const update = () => {
      const width = node.clientWidth;
      const maxTiles = Math.max(
        1,
        Math.floor((width - SHOW_ALL_WIDTH - TILE_GAP) / (TILE_WIDTH + TILE_GAP))
      );
      setVisibleCount(Math.min(tiles.length, maxTiles));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => observer.disconnect();
  }, [isSearching, tiles.length]);

  const visible = isSearching ? tiles : tiles.slice(0, visibleCount);
  const remaining = isSearching ? 0 : Math.max(0, tiles.length - visible.length);

  return (
    <div ref={rowRef} className="flex w-full items-stretch gap-3 overflow-hidden">
      {visible.map((tile) => (
        <KnowledgeOptionCard
          key={tile.id}
          tile={tile}
          sources={sources}
          pending={pending}
          onAdd={onAdd}
          onPicker={onPicker}
          onToggle={onToggle}
          onComingSoon={onComingSoon}
        />
      ))}

      <button
        type="button"
        onClick={onShowAll}
        className="flex w-36 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2 py-4 text-center transition-colors hover:bg-muted/30"
      >
        <div className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground">
          <LayoutGridIcon className="size-4" />
        </div>
        {remaining > 0 ? (
          <span className="text-[11px] text-muted-foreground">{remaining} more</span>
        ) : null}
        <span className="text-xs font-medium">Show all</span>
      </button>
    </div>
  );
}

function KnowledgeOptionCard({
  tile,
  sources,
  pending,
  onAdd,
  onPicker,
  onToggle,
  onComingSoon,
}: {
  tile: KnowledgeTile;
  sources: KnowledgeSource[];
  pending: boolean;
  onAdd: (tile: KnowledgeTile) => void;
  onPicker: (tile: KnowledgeTile) => void;
  onToggle: (sourceId: string, enabled: boolean) => void;
  onComingSoon: (label: string) => void;
}) {
  const vendor = tile.kind === "group" ? primaryVendor(tile) : null;
  const sourceId = tileSourceId(tile);
  const source = sources.find((item) => {
    if (tile.kind === "group" && tile.optionKind && vendor) {
      return item.kind === tile.optionKind && item.vendorSlug === vendor.vendorSlug;
    }
    return sourceId ? item.id === sourceId : false;
  }) ?? null;
  const connected = source?.state === "connected";
  const canToggle = tile.interaction === "toggle" && tile.available && connected && source;
  const showConnect = tile.interaction === "toggle" && tile.available && !connected && vendor;
  const isClickable = tile.interaction === "add" || tile.interaction === "picker";

  const handleClick = () => {
    if (tile.interaction === "add") {
      onAdd(tile);
      return;
    }

    if (tile.interaction === "picker") {
      onPicker(tile);
      return;
    }

    if (!tile.available) {
      onComingSoon(tile.label);
    }
  };

  return (
    <div
      className={cn(
        "flex w-37 shrink-0 flex-col gap-3 rounded-lg border border-border bg-background p-4",
        isClickable && "cursor-pointer transition-colors hover:bg-muted/30"
      )}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={
        isClickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <IntegrationBrandIcon slug={tile.iconSlug} size="tile" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium leading-tight">{tile.label}</p>
        {tile.interaction === "toggle" && !tile.available ? (
          <p className="text-[11px] text-muted-foreground">Coming soon</p>
        ) : null}
        {showConnect ? (
          <Show when={{ role: "org:member" }}>
            <p className="text-[11px] text-muted-foreground">Ask an admin to connect</p>
          </Show>
        ) : null}
      </div>
    </div>
  );
}

function ConnectedKnowledgeCard({
  source,
  pending,
  onToggle,
  onOpen,
}: {
  source: KnowledgeSource;
  pending: boolean;
  onToggle: (sourceId: string, enabled: boolean) => void;
  onOpen: () => void;
}) {
  const iconSlug = source.vendorSlug ?? source.slug;
  const count = sourceItemCount(source);
  const isIntegration = isIntegrationKnowledgeSource(source);
  const canOpen = !isIntegration || source.enabled;

  return (
    <div
      className={cn("block h-full text-left", canOpen && "cursor-pointer")}
      onClick={canOpen ? onOpen : undefined}
      onKeyDown={
        canOpen
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
      role={canOpen ? "button" : undefined}
      tabIndex={canOpen ? 0 : undefined}
    >
      <Card
        size="sm"
        className={cn(
          "h-full border-border bg-background transition-shadow",
          canOpen && "hover:shadow-sm"
        )}
      >
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start gap-3">
            <IntegrationBrandIcon slug={iconSlug} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{source.name}</p>
                  {source.instanceName ? (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {source.instanceName}
                    </p>
                  ) : null}
                </div>
                {isIntegration ? (
                  <div
                    className="flex shrink-0 items-center gap-2"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <Label htmlFor={`knowledge-${source.id}`} className="sr-only">
                      Enable {source.name}
                    </Label>
                    <Switch
                      id={`knowledge-${source.id}`}
                      checked={source.enabled}
                      disabled={pending}
                      onCheckedChange={(checked) => onToggle(source.id, checked)}
                    />
                  </div>
                ) : (
                  null
                )}
              </div>
            </div>
          </div>
          {isIntegration && !source.enabled ? (
            <p className="text-xs text-muted-foreground">
              Enable to use {source.name} for this agent.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {resourceCountLabel(source.kind, count)}
              {source.lastSyncedAt
                ? ` · synced ${formatLastSyncAttempt(source.lastSyncedAt)}`
                : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function isIntegrationKnowledgeSource(source: KnowledgeSource) {
  return source.kind === "help_center" || source.kind === "tickets";
}

function sourceItemCount(source: KnowledgeSource) {
  if (source.kind === "help_center" && source.collections.length > 0) {
    return source.collections.reduce(
      (sum, collection) => sum + collection.articleCount,
      0
    );
  }

  if (source.kind === "website") {
    return source.resources.reduce(
      (sum, resource) =>
        resource.type === "url" ? sum + resource.pageCount : sum,
      0
    );
  }

  return source.resources.length;
}

function resourceCountLabel(kind: KnowledgeOptionKind, count: number) {
  const formatted = count.toLocaleString();

  switch (kind) {
    case "website":
      return `${formatted} ${count === 1 ? "page" : "pages"}`;
    case "files":
      return `${formatted} ${count === 1 ? "file" : "files"}`;
    case "qna":
      return `${formatted} ${count === 1 ? "Q&A" : "Q&As"}`;
    case "tickets":
      return `${formatted} ${count === 1 ? "ticket" : "tickets"}`;
    case "help_center":
      return `${formatted} ${count === 1 ? "article" : "articles"}`;
  }
}
