"use client";

import { FileIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AddKnowledgeFileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (names: string[]) => void;
  pending?: boolean;
};

export function AddKnowledgeFileDialog({
  open,
  onOpenChange,
  onSubmit,
  pending,
}: AddKnowledgeFileDialogProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(event.target.files ?? [])
      .map((file) => file.name.trim())
      .filter(Boolean);

    event.target.value = "";

    if (names.length === 0) {
      return;
    }

    onSubmit(names);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border border-border">
              <FileIcon className="size-4" />
            </div>
            <DialogTitle>Add files</DialogTitle>
          </div>
          <DialogDescription>
            Upload PDF, DOCX, or TXT files for this agent to retrieve from.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="knowledge-file-upload">Choose files</Label>
            <label
              htmlFor="knowledge-file-upload"
              className={cn(
                "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dotted border-input bg-transparent px-4 py-6 text-center transition-colors hover:bg-muted/50 has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                pending && "pointer-events-none cursor-not-allowed opacity-50"
              )}
            >
              <UploadIcon className="size-6 text-muted-foreground" />
              <span className="text-sm font-medium">Click to upload</span>
              <span className="text-xs text-muted-foreground">
                PDF, DOCX, TXT, or MD
              </span>
              <input
                id="knowledge-file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                multiple
                disabled={pending}
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
