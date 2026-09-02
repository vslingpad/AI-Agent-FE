"use client";

import { useEffect, useState } from "react";
import { MessageCircleQuestionIcon, PlusIcon, XIcon } from "lucide-react";
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Label } from "@/components/ui/label";

export type AddKnowledgeQnaInput = {
  title: string;
  questions: string[];
  answer: string;
};

type AddKnowledgeQnaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: AddKnowledgeQnaInput) => void;
  pending?: boolean;
  defaults?: {
    title?: string;
    questions?: string[];
    question?: string;
    answer?: string;
  };
  submitLabel?: string;
};

function normalizeQuestions(defaults?: AddKnowledgeQnaDialogProps["defaults"]) {
  if (defaults?.questions?.length) {
    return defaults.questions;
  }

  if (defaults?.question?.trim()) {
    return [defaults.question];
  }

  return [""];
}

export function AddKnowledgeQnaDialog({
  open,
  onOpenChange,
  onSubmit,
  pending,
  defaults,
  submitLabel = "Add Q&A source",
}: AddKnowledgeQnaDialogProps) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(defaults?.title ?? "");
    setQuestions(normalizeQuestions(defaults));
    setAnswer(defaults?.answer ?? "");
  }, [open, defaults?.title, defaults?.questions, defaults?.question, defaults?.answer]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedQuestions = questions.map((question) => question.trim()).filter(Boolean);
    const trimmedAnswer = answer.trim();

    if (!trimmedTitle || trimmedQuestions.length === 0 || !trimmedAnswer) {
      return;
    }

    onSubmit({
      title: trimmedTitle,
      questions: trimmedQuestions,
      answer: trimmedAnswer,
    });
    setTitle("");
    setQuestions([""]);
    setAnswer("");
    onOpenChange(false);
  };

  const updateQuestion = (index: number, value: string) => {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? value : question
      )
    );
  };

  const addQuestion = () => {
    setQuestions((current) => [...current, ""]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((current) =>
      current.length === 1 ? [""] : current.filter((_, questionIndex) => questionIndex !== index)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border border-border">
              <MessageCircleQuestionIcon className="size-4" />
            </div>
            <DialogTitle>Add Q&amp;A</DialogTitle>
          </div>
          <DialogDescription>
            Q&amp;As are used for exact answers. Instructions can&apos;t be given here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="knowledge-qna-title">Title</Label>
              <Input
                id="knowledge-qna-title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex: Refund requests"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Questions</Label>
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                    <Input
                      id={`knowledge-qna-question-${index}`}
                      value={question}
                      onChange={(event) => updateQuestion(index, event.target.value)}
                      placeholder="Ex: How do I request a refund?"
                      required={index === 0}
                    />
                      {questions.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="size-7 text-muted-foreground"
                          aria-label={`Remove question ${index + 1}`}
                          onClick={() => removeQuestion(index)}
                        >
                          <XIcon className="size-3.5" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={addQuestion}
              >
                <PlusIcon className="size-4" />
                Add question
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="knowledge-qna-answer">Answer</Label>
              <RichTextEditor
                id="knowledge-qna-answer"
                value={answer}
                onChange={setAnswer}
                placeholder="Enter your answer…"
                minHeightClassName="min-h-48"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
