"use client";

import { useEffect, useRef } from "react";
import { Tiptap, useEditor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { createRichTextEditorExtensions } from "./extensions";
import { RichTextEditorLinkPopover } from "./link/link-popover";
import { RichTextEditorToolbar } from "./toolbar";
import { htmlToMarkdown, markdownToHtml } from "./utils";

export type RichTextEditorProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
  className?: string;
};

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  minHeightClassName = "min-h-32",
  className,
}: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: createRichTextEditorExtensions(placeholder),
    content: markdownToHtml(value),
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: cn("tiptap", minHeightClassName),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChangeRef.current(htmlToMarkdown(currentEditor.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentMarkdown = htmlToMarkdown(editor.getHTML());

    if (currentMarkdown !== value) {
      editor.commands.setContent(markdownToHtml(value), { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-input bg-background shadow-xs",
          className
        )}
      >
        <div className={cn("border-t border-border", minHeightClassName)} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-input bg-background shadow-xs",
        className
      )}
    >
      <Tiptap editor={editor}>
        <RichTextEditorLinkPopover>
          <RichTextEditorToolbar />
          <Tiptap.Content role="presentation" />
        </RichTextEditorLinkPopover>
      </Tiptap>
    </div>
  );
}
