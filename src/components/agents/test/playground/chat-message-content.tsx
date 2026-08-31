import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function renderInline(text: string, inverted: boolean) {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|https?:\/\/[^\s]+)/g;
  const parts = text.split(pattern).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className={cn(
            "rounded px-1 py-0.5 font-mono text-xs",
            inverted ? "bg-primary-foreground/15" : "bg-background/70"
          )}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noreferrer"
          className={cn("underline underline-offset-2", inverted && "text-primary-foreground")}
        >
          {part}
        </a>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

function renderBlock(block: string, inverted: boolean) {
  const lines = block.split("\n").filter((line) => line.trim().length > 0);
  const isList = lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line.trim()));

  if (isList) {
    return (
      <ul className="list-disc space-y-1 pl-4">
        {lines.map((line, index) => (
          <li key={index}>{renderInline(line.trim().replace(/^[-*]\s+/, ""), inverted)}</li>
        ))}
      </ul>
    );
  }

  const isOrderedList =
    lines.length > 0 && lines.every((line) => /^\d+\.\s+/.test(line.trim()));

  if (isOrderedList) {
    return (
      <ol className="list-decimal space-y-1 pl-4">
        {lines.map((line, index) => (
          <li key={index}>{renderInline(line.trim().replace(/^\d+\.\s+/, ""), inverted)}</li>
        ))}
      </ol>
    );
  }

  return (
    <p className="whitespace-pre-wrap">{renderInline(block, inverted)}</p>
  );
}

function renderBlocks(content: string, inverted: boolean) {
  const parts: ReactNode[] = [];
  const codeBlockPattern = /```[\s\S]*?```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockPattern.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index).trim();

    if (before) {
      before.split(/\n{2,}/).forEach((block, index) => {
        parts.push(<Fragment key={`${lastIndex}-b-${index}`}>{renderBlock(block, inverted)}</Fragment>);
      });
    }

    const code = match[0].replace(/^```[^\n]*\n?/, "").replace(/```$/, "");
    parts.push(
      <pre
        key={`${match.index}-code`}
        className={cn(
          "overflow-x-auto rounded-md px-2 py-1.5 font-mono text-xs whitespace-pre-wrap",
          inverted ? "bg-primary-foreground/15" : "bg-background/70"
        )}
      >
        {code.trimEnd()}
      </pre>
    );

    lastIndex = match.index + match[0].length;
  }

  const tail = content.slice(lastIndex).trim();

  if (tail) {
    tail.split(/\n{2,}/).forEach((block, index) => {
      parts.push(<Fragment key={`tail-${index}`}>{renderBlock(block, inverted)}</Fragment>);
    });
  }

  if (parts.length === 0) {
    return renderBlock(content, inverted);
  }

  return parts;
}

export function ChatMessageContent({
  content,
  inverted = false,
}: {
  content: string;
  inverted?: boolean;
}) {
  return (
    <div className={cn("space-y-2 break-words text-sm leading-relaxed")}>
      {renderBlocks(content, inverted)}
    </div>
  );
}
