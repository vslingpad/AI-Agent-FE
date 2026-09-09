"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessageContent } from "@/components/agents/test/playground/chat-message-content";
import { ProcedureDebugPanel } from "@/components/agents/test/playground/procedure-debug-panel";
import {
  BotIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
} from "lucide-react";
import { AgentErrorState, AgentPlaygroundSkeleton } from "@/components/agents/agent-states";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useCreatePlaygroundSession,
  useSendPlaygroundMessage,
  useUpdatePlaygroundSession,
} from "@/hooks/use-agents";
import type { PlaygroundSession } from "@/lib/schemas/agents";
import { detectBrowserLocation } from "@/lib/geo/detect-location";
import { cn } from "@/lib/utils";

const promptTextareaClassName =
  "min-h-0 w-full flex-1 resize-none overflow-y-auto rounded-lg border border-input bg-transparent px-3 py-2 text-xs leading-relaxed shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AgentPlaygroundPage({ agentId }: { agentId: string }) {
  const {
    mutate,
    data: session,
    isPending,
    isError,
    reset,
  } = useCreatePlaygroundSession(agentId);

  useEffect(() => {
    reset();
    mutate();
  }, [agentId, mutate, reset]);

  if (isPending && !session) {
    return <AgentPlaygroundSkeleton />;
  }

  if (isError && !session) {
    return (
      <AgentErrorState
        message="Unable to start playground session."
        onRetry={() => {
          reset();
          mutate();
        }}
      />
    );
  }

  if (!session) {
    return <AgentPlaygroundSkeleton />;
  }

  return (
    <PlaygroundWorkspace
      key={session.id}
      agentId={agentId}
      session={session}
      onNewSession={() => mutate()}
      startingSession={isPending}
    />
  );
}

function PlaygroundWorkspace({
  agentId,
  session: initialSession,
  onNewSession,
  startingSession,
}: {
  agentId: string;
  session: PlaygroundSession;
  onNewSession: () => void;
  startingSession: boolean;
}) {
  const [session, setSession] = useState(initialSession);
  const [input, setInput] = useState("");
  const sendMessage = useSendPlaygroundMessage(agentId, session.id);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSession(initialSession);
    setInput("");
  }, [initialSession]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [session.messages.length, sendMessage.isPending]);

  const send = async () => {
    const text = input.trim();

    if (!text || sendMessage.isPending) {
      return;
    }

    setInput("");

    const geo = await detectBrowserLocation();
    const updated = await sendMessage.mutateAsync({
      content: text,
      ...geo,
    });
    setSession(updated);
  };

  return (
    <div className="flex h-[calc(100svh-var(--notification-banner-height)-3.5rem)] min-h-[32rem] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
        <div className="min-w-0 space-y-1">
          <h1 className="font-heading text-lg font-semibold">Playground</h1>
          <p className="text-xs text-muted-foreground">Session {session.sessionNumber}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNewSession}
          disabled={startingSession}
        >
          {startingSession ? (
            <>
              <LoaderCircleIcon className="animate-spin" />
              Starting…
            </>
          ) : (
            "New test"
          )}
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_350px]">
        <ChatPanel
          agentName={session.agentName}
          messages={session.messages}
          input={input}
          onInputChange={setInput}
          onSend={() => void send()}
          busy={sendMessage.isPending}
          scrollRef={scrollRef}
        />

        <PromptPanel
          agentId={agentId}
          sessionId={session.id}
          messages={session.messages}
          productionPrompt={session.productionPrompt}
          promptOverride={session.promptOverride}
          onSessionUpdate={setSession}
        />
      </div>
    </div>
  );
}

function ChatPanel({
  agentName,
  messages,
  input,
  onInputChange,
  onSend,
  busy,
  scrollRef,
}: {
  agentName: string;
  messages: PlaygroundSession["messages"];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  busy: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-muted/20 p-4">
      <div className="flex flex-col h-full items-center justify-center">
      <div className="flex h-full max-h-[600px] w-[400px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <BotIcon className="size-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Test {agentName} as a customer</p>
                <p className="text-sm text-muted-foreground">
                  Send a message to preview answers before publishing to a live
                  channel.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} agentName={agentName} />
              ))}
              {busy ? <TypingIndicator agentName={agentName} /> : null}
            </div>
          )}
        </div>
        <form
          className="shrink-0 border-t border-border p-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
        >
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSend();
                }
              }}
              placeholder="Type your message here..."
              disabled={busy}
              rows={1}
              className="max-h-24 min-h-9 min-w-0 flex-1 resize-none rounded-md border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
            />
            <Button
              type="submit"
              className="self-end"
              disabled={busy || !input.trim()}
            >
              Send
            </Button>
          </div>
        </form>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Enter to send · Shift+Enter for a new line
      </p>
      </div>
    </div>
  );
}

function ChatBubble({
  message,
  agentName,
}: {
  message: PlaygroundSession["messages"][number];
  agentName: string;
}) {
  const isUser = message.role === "user";
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(message.at));

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1",
        isUser ? "items-end pl-10" : "items-start pr-10"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 text-[11px] text-muted-foreground",
          isUser && "flex-row-reverse"
        )}
      >
        <span>{isUser ? "Customer" : agentName}</span>
        <span>{time}</span>
      </div>
      <div
        className={cn(
          "max-w-full px-3 py-2",
          isUser
            ? "rounded-2xl rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-2xl rounded-bl-sm bg-muted text-foreground"
        )}
      >
        <ChatMessageContent content={message.content} inverted={isUser} />
      </div>
    </div>
  );
}

function TypingIndicator({ agentName }: { agentName: string }) {
  return (
    <div className="flex w-full flex-col items-start gap-1 pr-10">
      <p className="text-[11px] text-muted-foreground">{agentName}</p>
      <div className="inline-flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}

function PromptPanel({
  agentId,
  sessionId,
  messages,
  productionPrompt,
  promptOverride,
  onSessionUpdate,
}: {
  agentId: string;
  sessionId: string;
  messages: PlaygroundSession["messages"];
  productionPrompt: string;
  promptOverride: string | null;
  onSessionUpdate: (session: PlaygroundSession) => void;
}) {
  const updateSession = useUpdatePlaygroundSession(agentId, sessionId);
  const [draft, setDraft] = useState(promptOverride ?? productionPrompt);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(promptOverride ?? productionPrompt);
    setDirty(false);
  }, [productionPrompt, promptOverride, sessionId]);

  const save = () => {
    const trimmed = draft.trim();
    const nextOverride = trimmed === productionPrompt.trim() ? null : trimmed;

    updateSession.mutate(
      { promptOverride: nextOverride },
      {
        onSuccess: (updated) => {
          setDirty(false);
          onSessionUpdate(updated);
        },
      }
    );
  };

  const reset = () => {
    setDraft(productionPrompt);
    updateSession.mutate(
      { promptOverride: null },
      {
        onSuccess: (updated) => {
          setDirty(false);
          onSessionUpdate(updated);
        },
      }
    );
  };

  return (
    <aside className="hidden h-full w-[350px] shrink-0 min-h-0 flex-col overflow-hidden border-l border-border bg-background lg:flex">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <p className="font-medium">Configuration</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Playground-only prompt override. Published settings are unchanged.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="playground-prompt">System prompt</Label>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={reset}
              disabled={updateSession.isPending}
            >
              <RotateCcwIcon className="size-3.5" />
              Reset
            </Button>
          </div>
          <textarea
            id="playground-prompt"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setDirty(true);
            }}
            className={promptTextareaClassName}
          />
        </div>

        <div className="flex shrink-0 justify-end">
          <Button
            size="sm"
            onClick={save}
            disabled={!dirty || updateSession.isPending}
          >
            {updateSession.isPending ? "Saving…" : "Apply prompt"}
          </Button>
        </div>

        <div className="shrink-0 border-t border-border pt-3">
          <ProcedureDebugPanel messages={messages} />
        </div>
      </div>
    </aside>
  );
}
