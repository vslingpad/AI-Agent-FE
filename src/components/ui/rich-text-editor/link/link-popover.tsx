"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { posToDOMRect } from "@tiptap/core";
import { useTiptap } from "@tiptap/react";
import {
  CornerDownLeftIcon,
  ExternalLinkIcon,
  Trash2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolbarButton } from "../toolbar-button";
import {
  canSetLink,
  getLinkHref,
  isLinkActive,
  normalizeLinkUrl,
} from "./link-utils";
import { useLinkHandler } from "./use-link-handler";

type LinkPopoverContextValue = {
  open: boolean;
  openPopover: () => void;
  closePopover: () => void;
};

const LinkPopoverContext = createContext<LinkPopoverContextValue | null>(null);

export function useLinkPopoverContext() {
  const context = useContext(LinkPopoverContext);

  if (!context) {
    throw new Error("useLinkPopoverContext must be used within RichTextEditorLinkPopover");
  }

  return context;
}

type RichTextEditorLinkPopoverProps = {
  children: ReactNode;
  autoOpenOnLinkActive?: boolean;
};

export function RichTextEditorLinkPopover({
  children,
  autoOpenOnLinkActive = true,
}: RichTextEditorLinkPopoverProps) {
  const { editor } = useTiptap();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const closePopover = useCallback(() => {
    setOpen(false);
  }, []);

  const { url, setUrl, setLink, removeLink, resetUrlFromSelection } = useLinkHandler({
    editor,
    onSetLink: closePopover,
  });

  const updatePosition = useCallback(() => {
    const { from, to } = editor.state.selection;
    const rect = posToDOMRect(editor.view, from, to);

    setPosition({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
  }, [editor]);

  const openPopover = useCallback(() => {
    if (!canSetLink(editor) && !isLinkActive(editor)) {
      return;
    }

    resetUrlFromSelection();
    setOpen(true);
    updatePosition();
  }, [editor, resetUrlFromSelection, updatePosition]);

  useEffect(() => {
    if (!autoOpenOnLinkActive) {
      return;
    }

    const handleSelectionUpdate = () => {
      if (!isLinkActive(editor)) {
        return;
      }

      setUrl(getLinkHref(editor));
      setOpen(true);
      updatePosition();
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [autoOpenOnLinkActive, editor, setUrl, updatePosition]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      updatePosition();
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);

    const handleReposition = () => {
      updatePosition();
    };

    editor.on("selectionUpdate", handleReposition);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.clearTimeout(timeoutId);
      editor.off("selectionUpdate", handleReposition);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [editor, open, updatePosition]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (panelRef.current?.contains(target)) {
        return;
      }

      if (editor.view.dom.contains(target)) {
        window.setTimeout(() => {
          if (!isLinkActive(editor)) {
            setOpen(false);
          }
        }, 0);
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [editor, open]);

  const contextValue = useMemo(
    () => ({
      open,
      openPopover,
      closePopover,
    }),
    [closePopover, open, openPopover]
  );

  const openExternalLink = () => {
    const href = normalizeLinkUrl(url);

    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <LinkPopoverContext.Provider value={contextValue}>
      {children}
      {open
        ? createPortal(
            <div
              ref={panelRef}
              className="z-50 flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-md"
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
              }}
              onMouseDown={(event) => {
                if (event.target === inputRef.current) {
                  return;
                }

                event.preventDefault();
              }}
            >
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="Paste a link..."
                className={cn(
                  "h-8 w-56 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
                )}
                onKeyDown={(event) => {
                  event.stopPropagation();

                  if (event.key === "Enter") {
                    event.preventDefault();
                    setLink();
                  }

                  if (event.key === "Escape") {
                    event.preventDefault();
                    closePopover();
                    editor.commands.focus();
                  }
                }}
              />
              <ToolbarButton label="Apply link" onClick={setLink}>
                <CornerDownLeftIcon className="size-3.5" />
              </ToolbarButton>
              <ToolbarButton
                label="Open link"
                disabled={!url.trim()}
                onClick={openExternalLink}
              >
                <ExternalLinkIcon className="size-3.5" />
              </ToolbarButton>
              <ToolbarButton label="Remove link" onClick={removeLink}>
                <Trash2Icon className="size-3.5" />
              </ToolbarButton>
            </div>,
            document.body
          )
        : null}
    </LinkPopoverContext.Provider>
  );
}
