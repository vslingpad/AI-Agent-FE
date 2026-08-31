"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  SearchIcon,
  XIcon,
} from "lucide-react";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getConnectWizardPath } from "@/lib/integrations/connector-paths";
import {
  KNOWLEDGE_VENDOR_GROUPS,
  SHOW_ALL_OTHER_TILES,
  type KnowledgeTile,
  type KnowledgeVendor,
  type KnowledgeVendorGroup,
} from "@/lib/knowledge/catalog";
import { cn } from "@/lib/utils";

type ShowAllKnowledgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
};

export function ShowAllKnowledgeDialog({
  open,
  onOpenChange,
  onSelect,
}: ShowAllKnowledgeDialogProps) {
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setQuery("");
    }
    onOpenChange(next);
  };

  const normalized = query.trim().toLowerCase();

  const otherTiles = SHOW_ALL_OTHER_TILES.filter((tile) =>
    matchesSearch([tile.label, tile.iconSlug], normalized)
  );

  const groups = KNOWLEDGE_VENDOR_GROUPS.map((group) => ({
    ...group,
    vendors: group.vendors.filter((vendor) =>
      matchesSearch([group.label, vendor.label, vendor.vendorSlug], normalized)
    ),
  })).filter((group) => group.vendors.length > 0);

  const hasResults = otherTiles.length > 0 || groups.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={panelRef}
        initialFocus={panelRef}
        showCloseButton={false}
        className="max-h-[min(85vh,720px)] overflow-y-auto sm:max-w-3xl"
      >
        <DialogHeader className="flex-row items-center gap-3">
          <DialogTitle className="shrink-0">Knowledge options</DialogTitle>
          <div className="relative ml-auto w-74">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search knowledge…"
              className="h-9 pl-8"
              aria-label="Search knowledge"
            />
          </div>
          <DialogClose
            render={
              <Button variant="ghost" size="icon-sm" className="shrink-0" />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        {!hasResults ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No knowledge options match “{query.trim()}”.
          </p>
        ) : (
          <div className="space-y-6">
            {otherTiles.length > 0 ? (
              <section className="space-y-2">
                <h3 className="text-sm font-medium">Add knowledge</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {otherTiles.map((tile) => (
                    <OtherTileItem
                      key={tile.id}
                      tile={tile}
                      onAddSelect={(id) => {
                        onSelect(id);
                        handleOpenChange(false);
                      }}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {groups.map((group) => (
              <VendorGroupSection key={group.id} group={group} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OtherTileItem({
  tile,
  onAddSelect,
}: {
  tile: KnowledgeTile;
  onAddSelect: (id: string) => void;
}) {
  const className = cn(
    "flex h-14 items-center justify-start gap-2 rounded-lg border border-border px-3 text-left text-sm font-medium transition-colors hover:bg-muted/50",
    !tile.available && "opacity-80"
  );

  const content = (
    <>
      <ShowAllTileIcon tile={tile} />
      <span className="min-w-0 flex-1 truncate">{tile.label}</span>
      {!tile.available ? <Badge variant="muted">Coming soon</Badge> : null}
    </>
  );

  if (tile.interaction === "add") {
    return (
      <button type="button" onClick={() => onAddSelect(tile.id)} className={className}>
        {content}
      </button>
    );
  }

  if (!tile.available) {
    return <div className={cn(className, "cursor-default")}>{content}</div>;
  }

  return (
    <Link href={getConnectWizardPath(tile.iconSlug)} className={className}>
      {content}
    </Link>
  );
}

function VendorGroupSection({ group }: { group: KnowledgeVendorGroup }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium">{group.label}</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {group.vendors.map((vendor) => (
          <VendorRow key={vendor.id} vendor={vendor} />
        ))}
      </div>
    </section>
  );
}

function VendorRow({ vendor }: { vendor: KnowledgeVendor }) {
  const className = cn(
    "flex h-14 items-center justify-start gap-2 rounded-lg border border-border px-3 text-left text-sm font-medium transition-colors hover:bg-muted/50",
    !vendor.available && "opacity-80"
  );

  const content = (
    <>
      <IntegrationBrandIcon slug={vendor.vendorSlug} size="sm" />
      <span className="min-w-0 flex-1 truncate">{vendor.label}</span>
      {!vendor.available ? <Badge variant="muted">Coming soon</Badge> : null}
    </>
  );

  if (!vendor.available) {
    return <div className={cn(className, "cursor-default")}>{content}</div>;
  }

  return (
    <Link href={getConnectWizardPath(vendor.connectSlug)} className={className}>
      {content}
    </Link>
  );
}

function ShowAllTileIcon({ tile }: { tile: KnowledgeTile }) {
  return <IntegrationBrandIcon slug={tile.iconSlug} size="sm" />;
}

function matchesSearch(values: (string | null | undefined)[], normalized: string) {
  if (!normalized) {
    return true;
  }

  return values
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(normalized));
}
