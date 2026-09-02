"use client";

import { useState } from "react";
import { useTiptap, useTiptapState } from "@tiptap/react";
import {
  BoldIcon,
  ChevronDownIcon,
  HeadingIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Redo2Icon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { canSetLink } from "./link/link-utils";
import { useLinkPopoverContext } from "./link/link-popover";
import { ToolbarButton, ToolbarDivider } from "./toolbar-button";
import { getActiveHeadingLabel } from "./utils";

const headingOptions = [
  { label: "Text", level: 0 },
  { label: "Heading 1", level: 1 },
  { label: "Heading 2", level: 2 },
  { label: "Heading 3", level: 3 },
] as const;

export function RichTextEditorToolbar() {
  const { editor } = useTiptap();
  const { open, openPopover } = useLinkPopoverContext();
  const toolbarState = useTiptapState((context) => ({
    canUndo: context.editor.can().undo(),
    canRedo: context.editor.can().redo(),
    isBold: context.editor.isActive("bold"),
    isItalic: context.editor.isActive("italic"),
    isUnderline: context.editor.isActive("underline"),
    isStrike: context.editor.isActive("strike"),
    isBulletList: context.editor.isActive("bulletList"),
    isOrderedList: context.editor.isActive("orderedList"),
    isLink: context.editor.isActive("link"),
    headingLabel: getActiveHeadingLabel(context.editor),
    isParagraph: context.editor.isActive("paragraph"),
    isH1: context.editor.isActive("heading", { level: 1 }),
    isH2: context.editor.isActive("heading", { level: 2 }),
    isH3: context.editor.isActive("heading", { level: 3 }),
    canSetLink: canSetLink(context.editor),
  }));

  const setHeading = (level: 0 | 1 | 2 | 3) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
      return;
    }

    editor.chain().focus().toggleHeading({ level }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
      <ToolbarButton
        label="Undo"
        disabled={!toolbarState.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2Icon className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!toolbarState.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2Icon className="size-3.5" />
      </ToolbarButton>

      <ToolbarDivider />

      <HeadingMenu
        headingLabel={toolbarState.headingLabel}
        isParagraph={toolbarState.isParagraph}
        isH1={toolbarState.isH1}
        isH2={toolbarState.isH2}
        isH3={toolbarState.isH3}
        onSelect={setHeading}
      />

      <ToolbarDivider />

      <ToolbarButton
        label="Bold"
        active={toolbarState.isBold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={toolbarState.isItalic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={toolbarState.isUnderline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={toolbarState.isStrike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <StrikethroughIcon className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Bulleted list"
        active={toolbarState.isBulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListIcon className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={toolbarState.isOrderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrderedIcon className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Link"
        active={toolbarState.isLink || open}
        disabled={!toolbarState.canSetLink && !toolbarState.isLink}
        onClick={openPopover}
      >
        <LinkIcon className="size-3.5" />
      </ToolbarButton>
    </div>
  );
}

function HeadingMenu({
  headingLabel,
  isParagraph,
  isH1,
  isH2,
  isH3,
  onSelect,
}: {
  headingLabel: string;
  isParagraph: boolean;
  isH1: boolean;
  isH2: boolean;
  isH3: boolean;
  onSelect: (level: 0 | 1 | 2 | 3) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-muted-foreground"
            aria-label="Heading"
          >
            <HeadingIcon className="size-3.5" />
            <span className="max-w-20 truncate text-xs">{headingLabel}</span>
            <ChevronDownIcon className="size-3.5 opacity-60" />
          </Button>
        }
      />
      <PopoverContent
        align="start"
        className="w-40 gap-1 p-1"
        onMouseDown={(event) => event.preventDefault()}
      >
        {headingOptions.map((option) => (
          <button
            key={option.label}
            type="button"
            className={cn(
              "flex w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
              (option.level === 0 && isParagraph) ||
                (option.level === 1 && isH1) ||
                (option.level === 2 && isH2) ||
                (option.level === 3 && isH3)
                ? "bg-accent text-accent-foreground"
                : "text-foreground"
            )}
            onClick={() => {
              onSelect(option.level);
              setOpen(false);
            }}
          >
            {option.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
