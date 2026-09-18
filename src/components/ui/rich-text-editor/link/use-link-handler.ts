"use client";

import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/core";
import { getLinkHref, normalizeLinkUrl } from "./link-utils";

type UseLinkHandlerOptions = {
  editor: Editor;
  onSetLink?: () => void;
};

export function useLinkHandler({ editor, onSetLink }: UseLinkHandlerOptions) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const syncUrl = () => {
      if (editor.isActive("link")) {
        setUrl(getLinkHref(editor));
      }
    };

    editor.on("selectionUpdate", syncUrl);
    return () => {
      editor.off("selectionUpdate", syncUrl);
    };
  }, [editor]);

  const setLink = useCallback(() => {
    const href = normalizeLinkUrl(url);

    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      onSetLink?.();
      return;
    }

    const chain = editor.chain().focus();

    if (editor.isActive("link")) {
      chain.extendMarkRange("link");
    }

    chain.setLink({ href }).run();
    onSetLink?.();
  }, [editor, onSetLink, url]);

  const removeLink = useCallback(() => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setUrl("");
    onSetLink?.();
  }, [editor, onSetLink]);

  const resetUrlFromSelection = useCallback(() => {
    setUrl(getLinkHref(editor));
  }, [editor]);

  return {
    url,
    setUrl,
    setLink,
    removeLink,
    resetUrlFromSelection,
  };
}
