"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { getConnectWizardPath } from "@/lib/integrations/connector-paths";

export function KnowledgeConnectActions({
  connectSlug,
  compact,
}: {
  connectSlug: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-1" : "flex flex-col items-end gap-1"}>
      <Show when={{ role: "org:admin" }}>
        <Button
          size="sm"
          variant="outline"
          className={compact ? "h-7 px-2 text-xs" : undefined}
          render={<Link href={getConnectWizardPath(connectSlug)} />}
        >
          Connect
        </Button>
      </Show>
      <Show when={{ role: "org:member" }}>
        <p className="text-[11px] text-muted-foreground">Ask your admin to connect</p>
      </Show>
    </div>
  );
}
