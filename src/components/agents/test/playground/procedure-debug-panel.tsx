"use client";

import type { PlaygroundMessage } from "@/lib/schemas/agents";

export function ProcedureDebugPanel({
  messages,
}: {
  messages: PlaygroundMessage[];
}) {
  const latest = [...messages]
    .reverse()
    .find((message) => message.role === "assistant" && message.procedureDebug);

  if (!latest?.procedureDebug) {
    return (
      <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
        No procedure matched on the latest turn. Send a message that matches a live
        procedure&apos;s &quot;When to use&quot; text.
      </div>
    );
  }

  const debug = latest.procedureDebug;

  return (
    <div className="space-y-2 rounded-lg border border-border p-3 text-xs">
      <p className="font-medium text-sm">Procedure trace</p>
      {debug.procedure_name ? (
        <p>
          <span className="text-muted-foreground">Procedure:</span>{" "}
          {String(debug.procedure_name)}
        </p>
      ) : null}
      {debug.step_id ? (
        <p>
          <span className="text-muted-foreground">Step:</span> {String(debug.step_id)}{" "}
          {debug.step_type ? `(${String(debug.step_type)})` : ""}
        </p>
      ) : null}
      {debug.trigger_score != null ? (
        <p>
          <span className="text-muted-foreground">Trigger score:</span>{" "}
          {Number(debug.trigger_score).toFixed(2)}
        </p>
      ) : null}
      <pre className="max-h-40 overflow-auto rounded bg-muted p-2">
        {JSON.stringify(debug, null, 2)}
      </pre>
    </div>
  );
}
