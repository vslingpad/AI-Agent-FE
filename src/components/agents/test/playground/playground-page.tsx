"use client";

import { useState } from "react";
import { AgentErrorState, AgentPlaygroundSkeleton } from "@/components/agents/agent-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAgentPlayground } from "@/hooks/use-agents";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type DebugState = {
  intent: string;
  modelTier: string;
  modelName: string;
  procedure: string;
  sources: string[];
  confidence: number;
  tools: string[];
};

const starterDebug: DebugState = {
  intent: "—",
  modelTier: "medium",
  modelName: "claude-sonnet",
  procedure: "None",
  sources: [],
  confidence: 0,
  tools: [],
};

export function AgentPlaygroundPage({ agentId }: { agentId: string }) {
  const { data, isLoading, isError, refetch } = useAgentPlayground(agentId);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [debug, setDebug] = useState<DebugState>(starterDebug);
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState(1);

  if (isLoading) {
    return <AgentPlaygroundSkeleton />;
  }

  if (isError || !data) {
    return (
      <AgentErrorState message="Unable to load playground." onRetry={() => refetch()} />
    );
  }

  const send = async () => {
    const text = input.trim();

    if (!text || busy) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setBusy(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    const reply = mockReply(text, data.name);
    setMessages((current) => [
      ...current,
      { id: `a-${Date.now()}`, role: "assistant", content: reply.content },
    ]);
    setDebug(reply.debug);
    setBusy(false);
  };

  const newTest = () => {
    setMessages([]);
    setDebug(starterDebug);
    setSession((value) => value + 1);
  };

  return (
    <div className="flex h-[calc(100svh-var(--notification-banner-height)-3.5rem)] min-h-[32rem] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-3">
        <div>
          <h1 className="font-heading text-lg font-semibold">Playground</h1>
          <p className="text-xs text-muted-foreground">
            Session {session} · first AI reply uses 1 conversation credit ·{" "}
            {data.remainingCredits} remaining
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={newTest}>
          New test
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_280px]">
        <div className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4">
            {messages.length === 0 ? (
              <p className="pt-8 text-sm text-muted-foreground">
                Send a customer message to see how {data.name} answers, which
                sources it uses, and which procedure or tool it calls.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                </div>
              ))
            )}
            {busy ? (
              <p className="text-xs text-muted-foreground">Thinking…</p>
            ) : null}
          </div>

          <form
            className="flex gap-2 border-t border-border p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask as a customer…"
              className="h-9 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button type="submit" disabled={busy || !input.trim()}>
              Send
            </Button>
          </form>
        </div>

        <aside className="hidden overflow-y-auto border-l border-border p-4 text-sm lg:block">
          <p className="mb-3 font-medium">Debug</p>
          <dl className="space-y-3">
            <DebugRow label="Intent" value={debug.intent} />
            <DebugRow
              label="Model"
              value={`${debug.modelTier} · ${debug.modelName}`}
            />
            <div>
              <dt className="text-xs text-muted-foreground">Procedure</dt>
              <dd className="mt-0.5">{debug.procedure}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Tools</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {debug.tools.length === 0 ? (
                  <span>—</span>
                ) : (
                  debug.tools.map((tool) => (
                    <Badge key={tool} variant="outline">
                      {tool}
                    </Badge>
                  ))
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Sources</dt>
              <dd className="mt-1 space-y-1">
                {debug.sources.length === 0
                  ? "—"
                  : debug.sources.map((source) => (
                      <p key={source}>{source}</p>
                    ))}
              </dd>
            </div>
            <DebugRow
              label="Confidence"
              value={debug.confidence ? `${Math.round(debug.confidence * 100)}%` : "—"}
            />
          </dl>
        </aside>
      </div>
    </div>
  );
}

function DebugRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-mono text-xs">{value}</dd>
    </div>
  );
}

function mockReply(prompt: string, agentName: string) {
  const lower = prompt.toLowerCase();

  if (lower.includes("order") || lower.includes("track")) {
    return {
      content:
        "Order 11902 is with UPS and out for delivery today. Tracking number 1Z999AA10123456784.",
      debug: {
        intent: "order_status",
        modelTier: "low",
        modelName: "gpt-4.1-mini",
        procedure: "Order status · step 3/4",
        sources: ["Order Lookup tool"],
        confidence: 0.91,
        tools: ["order_lookup"],
      },
    };
  }

  if (lower.includes("refund")) {
    return {
      content:
        "Refunds are issued within 5–7 business days after approval. Sale items follow a 14-day window. I can start a refund if you share the order ID.",
      debug: {
        intent: "refund_policy",
        modelTier: "medium",
        modelName: "claude-sonnet",
        procedure: "Refund escalation · step 1/6",
        sources: ["Refund policy.pdf", "Zendesk · Billing & Refunds"],
        confidence: 0.64,
        tools: [],
      },
    };
  }

  return {
    content: `${agentName} here. I can help with that from the knowledge base. Could you share a bit more detail, or an order ID if this is about a purchase?`,
    debug: {
      intent: "general",
      modelTier: "low",
      modelName: "gpt-4.1-mini",
      procedure: "None",
      sources: ["Native Q&A"],
      confidence: 0.71,
      tools: ["search_knowledge_base"],
    },
  };
}
