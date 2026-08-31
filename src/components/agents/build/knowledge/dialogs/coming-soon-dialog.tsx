"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ComingSoonDialog({
  label,
  onOpenChange,
}: {
  label: string | null;
  onOpenChange: () => void;
}) {
  return (
    <Dialog open={Boolean(label)} onOpenChange={(open) => !open && onOpenChange()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{label} — coming soon</DialogTitle>
          <DialogDescription>
            This integration is not available in the current launch. Use Website,
            uploaded files, Q&amp;A, or Zendesk Help Center and Tickets for now.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onOpenChange}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
