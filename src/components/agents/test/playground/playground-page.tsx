"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useResetKey } from "@/hooks/use-reset-key";
import { useOrganization } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { ChatMessageContent } from "@/components/agents/test/playground/chat-message-content";
import { ProcedureDebugPanel } from "@/components/agents/test/playground/procedure-debug-panel";
import { BotIcon, RotateCcwIcon } from "lucide-react";
import { AgentErrorState, AgentPlaygroundSkeleton } from "@/components/agents/agent-states";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useAgent,
  useAgentSettings,
  useCreatePlaygroundSession,
  useUpdatePlaygroundSession,
} from "@/hooks/use-agents";
import { sendPlaygroundMessage as sendPlaygroundMessageApi } from "@/lib/api/agents";
import {
  PLAYGROUND_PROMPT_MAX_LENGTH,
  type PlaygroundMessage,
  type PlaygroundSession,
} from "@/lib/schemas/agents";
import { detectBrowserLocation } from "@/lib/geo/detect-location";
import { cn } from "@/lib/utils";

const promptTextareaClassName =
  "min-h-0 w-full flex-1 resize-none overflow-y-auto rounded-lg border border-input bg-transparent px-3 py-2 text-xs leading-relaxed shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function playgroundSessionKey(
  orgId: string | undefined,
  agentId: string,
  sessionId: string
) {
  return ["agents", orgId, agentId, "playground", sessionId] as const;
}

function promptOverrideFromDraft(draft: string, productionPrompt: string) {
  const trimmed = draft.trim();
  return trimmed === productionPrompt.trim() ? null : trimmed;
}

function clampPlaygroundPrompt(value: string) {
  return value.slice(0, PLAYGROUND_PROMPT_MAX_LENGTH);
}

function createPendingUserMessage(content: string): PlaygroundMessage {
  return {
    id: `pending-${crypto.randomUUID()}`,
    role: "user",
    content,
    at: new Date().toISOString(),
  };
}

export function AgentPlaygroundPage({ agentId }: { agentId: string }) {
  const {
    data: agent,
    isPending: agentPending,
    isError: agentError,
    refetch: refetchAgent,
  } = useAgent(agentId);
  const {
    data: settings,
    isPending: settingsPending,
    isError: settingsError,
    refetch: refetchSettings,
  } = useAgentSettings(agentId);
  const [session, setSession] = useState<PlaygroundSession | null>(null);
  const createSession = useCreatePlaygroundSession(agentId);

  if (agentPending || settingsPending) {
    return <AgentPlaygroundSkeleton />;
  }

  if (agentError || settingsError || !agent || !settings) {
    return (
      <AgentErrorState
        message="Unable to load playground."
        onRetry={() => {
          void refetchAgent();
          void refetchSettings();
        }}
      />
    );
  }

  return (
    <PlaygroundWorkspace
      agentId={agentId}
      agentName={agent.name}
      productionPrompt={settings.systemPrompt}
      session={session}
      onSessionChange={setSession}
      createSession={createSession}
      onNewSession={() => setSession(null)}
    />
  );
}

function PlaygroundWorkspace({
  agentId,
  agentName,
  productionPrompt,
  session,
  onSessionChange,
  createSession,
  onNewSession,
}: {
  agentId: string;
  agentName: string;
  productionPrompt: string;
  session: PlaygroundSession | null;
  onSessionChange: (session: PlaygroundSession | null) => void;
  createSession: ReturnType<typeof useCreatePlaygroundSession>;
  onNewSession: () => void;
}) {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const [input, setInput] = useState("");
  const [preSessionPromptDraft, setPreSessionPromptDraft] = useState(productionPrompt);
  const [preSessionAppliedPrompt, setPreSessionAppliedPrompt] = useState(productionPrompt);
  const preSessionPromptDirty = preSessionPromptDraft !== preSessionAppliedPrompt;
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [pendingUserMessage, setPendingUserMessage] =
    useState<PlaygroundMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = session?.messages ?? [];
  const visibleMessages = pendingUserMessage
    ? [...messages, pendingUserMessage]
    : messages;
  const busy = sending || createSession.isPending;

  if (useResetKey(session ? "session" : `pre:${productionPrompt}`) && !session) {
    setPreSessionPromptDraft(productionPrompt);
    setPreSessionAppliedPrompt(productionPrompt);
  }

  const cacheSession = useCallback(
    (active: PlaygroundSession) => {
      queryClient.setQueryData(
        playgroundSessionKey(organization?.id, agentId, active.id),
        active
      );
    },
    [agentId, organization?.id, queryClient]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [visibleMessages.length, busy]);

  const send = async () => {
    const text = input.trim();

    if (!text || busy) {
      return;
    }

    setSendError(null);
    setInput("");
    setSending(true);
    setPendingUserMessage(createPendingUserMessage(text));

    try {
      const geo = await detectBrowserLocation();
      let active = session;
      if (!active) {
        const promptForCreate = preSessionPromptDirty
          ? preSessionPromptDraft
          : preSessionAppliedPrompt;
        active = await createSession.mutateAsync({
          promptOverride: promptOverrideFromDraft(promptForCreate, productionPrompt),
        });
        cacheSession(active);
        onSessionChange(active);
      }

      const updated = await sendPlaygroundMessageApi(agentId, active.id, {
        content: text,
        ...geo,
      });
      cacheSession(updated);
      onSessionChange(updated);
    } catch {
      setSendError("Unable to send message. Try again.");
      setInput(text);
    } finally {
      setPendingUserMessage(null);
      setSending(false);
    }
  };

  const startNewTest = () => {
    setInput("");
    setSendError(null);
    setPendingUserMessage(null);
    setPreSessionPromptDraft(productionPrompt);
    setPreSessionAppliedPrompt(productionPrompt);
    onNewSession();
  };

  return (
    <div className="flex h-[calc(100svh-var(--notification-banner-height)-3.5rem)] min-h-[32rem] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
        <div className="min-w-0">
          <h1 className="font-heading text-lg font-semibold">Playground</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={startNewTest}
          disabled={busy}
        >
          New test
        </Button>
      </header>

      {sendError ? (
        <p className="border-b border-border bg-destructive/10 px-6 py-2 text-sm text-destructive">
          {sendError}
        </p>
      ) : null}

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_350px]">
        <ChatPanel
          agentName={session?.agentName ?? agentName}
          messages={visibleMessages}
          input={input}
          onInputChange={setInput}
          onSend={() => void send()}
          busy={busy}
          scrollRef={scrollRef}
        />

        {session ? (
          <PromptPanelConnected
            agentId={agentId}
            sessionId={session.id}
            messages={messages}
            productionPrompt={session.productionPrompt}
            promptOverride={session.promptOverride}
            onSessionUpdate={onSessionChange}
          />
        ) : (
          <PromptPanelLocal
            productionPrompt={productionPrompt}
            draft={preSessionPromptDraft}
            onDraftChange={(value) =>
              setPreSessionPromptDraft(clampPlaygroundPrompt(value))
            }
            onApply={() => setPreSessionAppliedPrompt(preSessionPromptDraft)}
          />
        )}
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
          {messages.length === 0 && !busy ? (
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
      <div className="inline-flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-5 py-4">
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}

function PromptCharCount({ length }: { length: number }) {
  const atLimit = length >= PLAYGROUND_PROMPT_MAX_LENGTH;

  return (
    <span
      className={cn(
        "text-xs tabular-nums text-muted-foreground",
        atLimit && "text-destructive"
      )}
    >
      {length}/{PLAYGROUND_PROMPT_MAX_LENGTH}
    </span>
  );
}

function PromptPanelLocal({
  productionPrompt,
  draft,
  onDraftChange,
  onApply,
}: {
  productionPrompt: string;
  draft: string;
  onDraftChange: (draft: string) => void;
  onApply: () => void;
}) {
  const reset = () => {
    onDraftChange(productionPrompt);
  };

  return (
    <PromptPanelShell messages={[]}>
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="playground-prompt">System prompt</Label>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={reset}>
            <RotateCcwIcon className="size-3.5" />
            Reset
          </Button>
        </div>
        <textarea
          id="playground-prompt"
          value={draft}
          maxLength={PLAYGROUND_PROMPT_MAX_LENGTH}
          onChange={(event) => onDraftChange(event.target.value)}
          className={promptTextareaClassName}
        />
        <div className="flex shrink-0 items-center justify-between gap-2">
          <PromptCharCount length={draft.length} />
          <Button size="sm" onClick={onApply}>
            Apply prompt
          </Button>
        </div>
      </div>
    </PromptPanelShell>
  );
}

function PromptPanelConnected({
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

  if (useResetKey(`${sessionId}:${promptOverride ?? productionPrompt}`)) {
    setDraft(promptOverride ?? productionPrompt);
    setDirty(false);
  }

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
    <PromptPanelShell messages={messages}>
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
          maxLength={PLAYGROUND_PROMPT_MAX_LENGTH}
          onChange={(event) => {
            setDraft(clampPlaygroundPrompt(event.target.value));
            setDirty(true);
          }}
          className={promptTextareaClassName}
        />
        <div className="flex shrink-0 items-center justify-between gap-2">
          <PromptCharCount length={draft.length} />
          <Button
            size="sm"
            onClick={save}
            disabled={!dirty || updateSession.isPending}
          >
            {updateSession.isPending ? "Saving…" : "Apply prompt"}
          </Button>
        </div>
      </div>
    </PromptPanelShell>
  );
}

function PromptPanelShell({
  messages,
  children,
}: {
  messages: PlaygroundSession["messages"];
  children: React.ReactNode;
}) {
  return (
    <aside className="hidden h-full w-[350px] shrink-0 min-h-0 flex-col overflow-hidden border-l border-border bg-background lg:flex">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <p className="font-medium">Configuration</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          This configuration is for playground use only and will not affect published settings.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
        {children}

        <div className="shrink-0 border-t border-border pt-3">
          <ProcedureDebugPanel messages={messages} />
        </div>
      </div>
    </aside>
  );
}
