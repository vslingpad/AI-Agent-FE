import type { Editor } from "@tiptap/react";
import { marked } from "marked";
import TurndownService from "turndown";

const turndown = new TurndownService({ headingStyle: "atx" });

export function markdownToHtml(markdown: string) {
  if (!markdown.trim()) {
    return "";
  }

  return marked.parse(markdown, { async: false }) as string;
}

export function htmlToMarkdown(html: string) {
  if (!html.trim() || html === "<p></p>") {
    return "";
  }

  return turndown.turndown(html).trim();
}

export function normalizeUrl(url: string) {
  const trimmed = url.trim();

  if (!trimmed) {
    return "";
  }

  if (/^(https?:\/\/|mailto:|tel:|#)/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getActiveHeadingLabel(editor: Editor) {
  if (editor.isActive("heading", { level: 1 })) {
    return "Heading 1";
  }

  if (editor.isActive("heading", { level: 2 })) {
    return "Heading 2";
  }

  if (editor.isActive("heading", { level: 3 })) {
    return "Heading 3";
  }

  return "Text";
}
