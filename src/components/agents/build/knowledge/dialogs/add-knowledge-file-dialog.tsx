"use client";

import { FileIcon } from "lucide-react";
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

type AddKnowledgeFileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
  pending?: boolean;
};

export function AddKnowledgeFileDialog({
  open,
  onOpenChange,
  onSubmit,
  pending,
}: AddKnowledgeFileDialogProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onSubmit(file.name);
    event.target.value = "";
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
            <Label htmlFor="knowledge-file-upload">Choose file</Label>
            <Input
              id="knowledge-file-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md"
              disabled={pending}
              onChange={handleFileChange}
            />
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
