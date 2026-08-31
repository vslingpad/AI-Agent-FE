"use client";

import { GlobeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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

type AddKnowledgeWebsiteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string) => void;
  pending?: boolean;
};

export function AddKnowledgeWebsiteDialog({
  open,
  onOpenChange,
  onSubmit,
  pending,
}: AddKnowledgeWebsiteDialogProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const url = String(formData.get("url") ?? "").trim();

    if (!url) {
      return;
    }

    onSubmit(url);
    event.currentTarget.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border border-border">
              <GlobeIcon className="size-4" />
            </div>
            <DialogTitle>Add website</DialogTitle>
          </div>
          <DialogDescription>
            Crawl a public URL so this agent can retrieve pages from it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="knowledge-website-url">Website URL</Label>
            <Input
              id="knowledge-website-url"
              name="url"
              type="url"
              placeholder="https://help.acme.com"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              Add website
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
