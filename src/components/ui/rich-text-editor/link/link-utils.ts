import type { Editor } from "@tiptap/core";

export function normalizeLinkUrl(url: string) {
  const trimmed = url.trim();

  if (!trimmed) {
    return "";
  }

  if (/^(https?:\/\/|mailto:|tel:|#)/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function isLinkActive(editor: Editor) {
  return editor.isActive("link");
}

export function canSetLink(editor: Editor) {
  return editor.can().setLink({ href: "https://example.com" });
}

export function getLinkHref(editor: Editor) {
  return (editor.getAttributes("link").href as string | undefined) ?? "";
}
