"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { SearchIcon, XIcon } from "lucide-react";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { useResetKey } from "@/hooks/use-reset-key";
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
import type { IntegrationCatalogItem } from "@/lib/schemas/integrations";
import { cn } from "@/lib/utils";

type ShowAllActionsDialogProps = {
  catalog: IntegrationCatalogItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function matchesActionSearch(item: IntegrationCatalogItem, query: string) {
  if (!query.trim()) {
    return true;
  }

  const normalized = query.trim().toLowerCase();

  return [item.name, item.description, item.slug, ...item.action_highlights]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalized));
}

export function ShowAllActionsDialog({
  catalog,
  open,
  onOpenChange,
}: ShowAllActionsDialogProps) {
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  if (useResetKey(open) && open) {
    setQuery("");
  }

  const filtered = catalog.filter((item) => matchesActionSearch(item, query));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={panelRef}
        initialFocus={panelRef}
        showCloseButton={false}
        className="max-h-[min(85vh,720px)] overflow-y-auto sm:max-w-3xl"
      >
        <DialogHeader className="flex-row items-center gap-3">
          <DialogTitle className="shrink-0">Connect an action</DialogTitle>
          <div className="relative ml-auto w-74">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search actions…"
              className="h-9 pl-8"
              aria-label="Search actions"
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

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No actions match “{query.trim()}”.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((item) => (
              <ShowAllActionItem key={item.slug} item={item} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ShowAllActionItem({ item }: { item: IntegrationCatalogItem }) {
  const available = item.available;
  const className =
    "flex h-14 items-center justify-start gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors";

  if (available) {
    return (
      <Link
        href={getConnectWizardPath(item.slug, { from: "actions" })}
        className={cn(className, "hover:bg-muted/50")}
      >
        <IntegrationBrandIcon slug={item.slug} size="sm" />
        <span className="truncate">From {item.name}</span>
      </Link>
    );
  }

  return (
    <div className={cn(className, "opacity-80")}>
      <IntegrationBrandIcon slug={item.slug} size="sm" />
      <span className="min-w-0 flex-1 truncate">From {item.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground">Coming soon</span>
    </div>
  );
}
