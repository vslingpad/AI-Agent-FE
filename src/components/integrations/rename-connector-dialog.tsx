"use client";

import { useState } from "react";
import { useResetKey } from "@/hooks/use-reset-key";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUpdateConnector } from "@/hooks/use-integrations";
import type { OrgConnector } from "@/lib/schemas/integrations";

type RenameConnectorDialogProps = {
  connector: OrgConnector | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RenameConnectorDialog({
  connector,
  open,
  onOpenChange,
}: RenameConnectorDialogProps) {
  const [displayName, setDisplayName] = useState(connector?.display_name ?? "");
  const updateConnector = useUpdateConnector(connector?.id ?? "");

  if (useResetKey(connector) && connector) {
    setDisplayName(connector.display_name);
  }

  const handleSave = async () => {
    if (!connector || !displayName.trim()) {
      return;
    }

    await updateConnector.mutateAsync({ display_name: displayName.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename integration</DialogTitle>
          <DialogDescription>
            Give this connection a name your team will recognize. You can connect
            multiple instances of the same type.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="display-name">Display name</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Zendesk — EU Support"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!displayName.trim() || updateConnector.isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
