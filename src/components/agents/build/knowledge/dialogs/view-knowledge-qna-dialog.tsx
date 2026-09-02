"use client";

import { MessageCircleQuestionIcon } from "lucide-react";
import { ChatMessageContent } from "@/components/agents/test/playground/chat-message-content";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { KnowledgeResource } from "@/lib/schemas/agents";

type QnaResource = Extract<KnowledgeResource, { type: "qna" }>;

type ViewKnowledgeQnaDialogProps = {
  resource: QnaResource | null;
  onOpenChange: (open: boolean) => void;
};

export function ViewKnowledgeQnaDialog({
  resource,
  onOpenChange,
}: ViewKnowledgeQnaDialogProps) {
  const questions =
    resource?.questions?.length ? resource.questions : resource ? [resource.question] : [];

  return (
    <Dialog open={resource !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border border-border">
              <MessageCircleQuestionIcon className="size-4" />
            </div>
            <DialogTitle>{resource?.title ?? "Q&A details"}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <p className="text-sm font-medium">Topic</p>
            <p className="text-sm text-muted-foreground">{resource?.title ?? "—"}</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Questions</p>
            <ol className="space-y-2 text-sm text-muted-foreground">
              {questions.map((question, index) => (
                <li key={index} className="flex gap-2">
                  <span className="shrink-0 font-medium text-foreground">{index + 1}.</span>
                  <span>{question}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Answer</p>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              {resource?.answer ? (
                <ChatMessageContent content={resource.answer} />
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
