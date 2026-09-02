import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

export function createRichTextEditorExtensions(placeholder?: string) {
  return [
    StarterKit.configure({
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
      heading: {
        levels: [1, 2, 3],
      },
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        enableClickSelection: true,
      },
    }),
    Placeholder.configure({
      placeholder: placeholder ?? "",
    }),
  ];
}
