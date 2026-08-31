"use client";

import { MessageCircleQuestionIcon } from "lucide-react";
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

type AddKnowledgeQnaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { title: string; question: string; answer: string }) => void;
  pending?: boolean;
};

export function AddKnowledgeQnaDialog({
  open,
  onOpenChange,
  onSubmit,
  pending,
}: AddKnowledgeQnaDialogProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const question = String(formData.get("question") ?? "").trim();
    const answer = String(formData.get("answer") ?? "").trim();

    if (!title || !question || !answer) {
      return;
    }

    onSubmit({ title, question, answer });
    event.currentTarget.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border border-border">
              <MessageCircleQuestionIcon className="size-4" />
            </div>
            <DialogTitle>Add Q&A</DialogTitle>
          </div>
          <DialogDescription>
            Q&amp;As are used for exact answers. Instructions can&apos;t be given here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="knowledge-qna-title">Title</Label>
            <Input
              id="knowledge-qna-title"
              name="title"
              placeholder="Ex: Refund requests"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="knowledge-qna-question">Question</Label>
            <Input
              id="knowledge-qna-question"
              name="question"
              placeholder="Ex: How do I request a refund?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="knowledge-qna-answer">Answer</Label>
            <textarea
              id="knowledge-qna-answer"
              name="answer"
              rows={5}
              required
              placeholder="Enter your answer…"
              className="flex min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              Add Q&amp;A source
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
