"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutGridIcon } from "lucide-react";
import {
  ConnectChannelTile,
  type DeployChannelTile,
} from "@/components/agents/deploy/connect-channel-tile";

const TILE_WIDTH = 112;
const SHOW_ALL_WIDTH = 112;
const TILE_GAP = 12;
const ROW_WIDTH_BUFFER = 24;

function countVisibleTiles(rowWidth: number, tileCount: number) {
  const available = rowWidth - SHOW_ALL_WIDTH - ROW_WIDTH_BUFFER;

  if (available <= 0) {
    return 1;
  }

  const maxTiles = Math.floor(available / (TILE_WIDTH + TILE_GAP));
  return Math.max(1, Math.min(tileCount, maxTiles));
}

export function ConnectChannelRow({
  tiles,
  onShowAll,
  isSearching = false,
}: {
  tiles: DeployChannelTile[];
  onShowAll: () => void;
  isSearching?: boolean;
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
      setVisibleCount(countVisibleTiles(node.clientWidth, tiles.length));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => observer.disconnect();
  }, [isSearching, tiles.length]);

  const visible = isSearching ? tiles : tiles.slice(0, visibleCount);
  const remaining = isSearching ? 0 : Math.max(0, tiles.length - visible.length);

  return (
    <div ref={rowRef} className="flex w-full min-w-0 items-stretch gap-3 overflow-hidden">
      {visible.map((tile) => (
        <ConnectChannelTile
          key={tile.kind === "catalog" ? tile.item.slug : tile.channel.id}
          tile={tile}
        />
      ))}

      <button
        type="button"
        onClick={onShowAll}
        className="flex w-28 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3 text-center transition-colors hover:bg-muted/40"
      >
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
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
