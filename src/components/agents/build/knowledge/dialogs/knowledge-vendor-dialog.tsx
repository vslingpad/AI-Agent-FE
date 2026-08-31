"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { IntegrationBrandIcon } from "@/components/integrations/connector-instance-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getConnectWizardPath } from "@/lib/integrations/connector-paths";
import type { KnowledgeVendor } from "@/lib/knowledge/catalog";
import type { KnowledgeOptionKind, KnowledgeSource } from "@/lib/schemas/agents";

type KnowledgeVendorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  optionKind: KnowledgeOptionKind;
  vendors: KnowledgeVendor[];
  sources: KnowledgeSource[];
};

export function KnowledgeVendorDialog({
  open,
  onOpenChange,
  title,
  description,
  optionKind,
  vendors,
  sources,
}: KnowledgeVendorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ul className="space-y-2">
          {vendors.map((vendor) => {
            const source = sources.find(
              (item) =>
                item.kind === optionKind && item.vendorSlug === vendor.vendorSlug
            );
            const connected = source?.state === "connected";

            return (
              <li
                key={vendor.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <IntegrationBrandIcon slug={vendor.vendorSlug} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{vendor.label}</p>
                  </div>
                </div>

                {!vendor.available ? (
                  <Badge variant="muted">Coming soon</Badge>
                ) : (
                  <>
                    <Show when={{ role: "org:admin" }}>
                      <Button
                        size="sm"
                        render={
                          <Link href={getConnectWizardPath(vendor.connectSlug)} />
                        }
                      >
                        {connected ? "Connect another" : "Connect"}
                      </Button>
                    </Show>
                    <Show when={{ role: "org:member" }}>
                      <span className="text-xs text-muted-foreground">Ask an admin</span>
                    </Show>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
