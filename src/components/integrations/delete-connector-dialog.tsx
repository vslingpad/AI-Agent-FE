"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteConnector } from "@/hooks/use-integrations";
import type { OrgConnector } from "@/lib/schemas/integrations";

type DeleteConnectorDialogProps = {
  connector: OrgConnector | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectOnDelete?: boolean;
};

export function DeleteConnectorDialog({
  connector,
  open,
  onOpenChange,
  redirectOnDelete = false,
}: DeleteConnectorDialogProps) {
  const router = useRouter();
  const deleteConnector = useDeleteConnector();

  const handleDelete = async () => {
    if (!connector) {
      return;
    }

    await deleteConnector.mutateAsync(connector.id);
    onOpenChange(false);

    if (redirectOnDelete) {
      router.push("/integrations");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete integration</DialogTitle>
          <DialogDescription>
            This will revoke access and disconnect{" "}
            <span className="font-medium text-foreground">
              {connector?.displayName}
            </span>
            . Agents using this connector will stop receiving channel messages,
            knowledge, or actions from it.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteConnector.isPending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
