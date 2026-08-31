"use client";

import { useMemo, useState } from "react";
import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { AgentConversationsSkeleton, AgentErrorState } from "@/components/agents/agent-states";
import { Badge } from "@/components/ui/badge";
import { useAgentConversations } from "@/hooks/use-agents";
import { formatLastSyncAttempt } from "@/lib/integrations/connector-paths";
import type { AgentConversation, ConversationChannel, ConversationStatus } from "@/lib/schemas/agents";
import { cn } from "@/lib/utils";

const CHANNEL_LABEL: Record<ConversationChannel, string> = {
  web_chat: "Web Chat",
  zendesk: "Zendesk",
  playground: "Playground",
};

const STATUS_LABEL: Record<ConversationStatus, string> = {
  ai_active: "AI handling",
  handed_over: "Handed over",
  resolved: "Resolved",
};

export function AgentConversationsPage({ agentId }: { agentId: string }) {
  const { data, isLoading, isError, refetch } = useAgentConversations(agentId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => {
    const list = data?.conversations ?? [];
    return list.find((item) => item.id === selectedId) ?? list[0] ?? null;
  }, [data, selectedId]);

  if (isLoading) {
    return <AgentConversationsSkeleton />;
  }

  if (isError || !data) {
    return (
      <AgentErrorState
        message="Unable to load conversations."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <AgentPageFrame
      title="Conversations"
      description="Production and playground threads this agent handled. Session replay is off on this route."
    >
      {data.conversations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm font-medium">No conversations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish this agent and send a test in Playground, or wait for a live
            channel message.
          </p>
        </div>
      ) : (
        <div className="grid min-h-[28rem] overflow-hidden rounded-xl border border-border lg:grid-cols-[280px_1fr]">
          <ul className="divide-y overflow-y-auto border-b border-border lg:border-r lg:border-b-0">
            {data.conversations.map((conversation) => (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(conversation.id)}
                  className={cn(
                    "flex w-full flex-col items-start gap-1 px-4 py-3 text-left text-sm hover:bg-muted/60",
                    selected?.id === conversation.id && "bg-muted"
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="font-medium">{conversation.customerName}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatLastSyncAttempt(conversation.startedAt)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {conversation.preview}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {selected ? <Thread conversation={selected} /> : null}
        </div>
      )}
    </AgentPageFrame>
  );
}

function Thread({ conversation }: { conversation: AgentConversation }) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{conversation.customerName}</p>
          <p className="text-xs text-muted-foreground">{conversation.customerEmail}</p>
        </div>
        <Badge variant="outline">{CHANNEL_LABEL[conversation.channel]}</Badge>
        <Badge
          variant={
            conversation.status === "resolved"
              ? "success"
              : conversation.status === "handed_over"
                ? "warning"
                : "muted"
          }
        >
          {STATUS_LABEL[conversation.status]}
        </Badge>
        {conversation.billable ? <Badge variant="secondary">Billable</Badge> : null}
        {conversation.knowledgeGap ? (
          <Badge variant="warning">Knowledge gap</Badge>
        ) : null}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[85%] rounded-xl px-3 py-2 text-sm",
              message.role === "customer" && "bg-muted",
              message.role === "assistant" && "ml-auto bg-primary text-primary-foreground",
              message.role === "system" &&
                "mx-auto max-w-full bg-amber-50 text-center text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            )}
          >
            {message.content}
          </div>
        ))}
      </div>
    </div>
  );
}
