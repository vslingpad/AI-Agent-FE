"use client";

import { conversationSnippets, truncateText } from "@/lib/conversations/conversation-utils";
import { formatLastSyncAttempt } from "@/lib/integrations/connector-paths";
import type { AgentConversation } from "@/lib/schemas/agents";
import { cn } from "@/lib/utils";

type ConversationListProps = {
  conversations: AgentConversation[];
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
};

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  return (
    <ul className="min-h-0 flex-1 divide-y overflow-y-auto border-r border-border">
      {conversations.map((conversation) => {
        const { firstCustomer, firstAssistant } = conversationSnippets(
          conversation.messages
        );

        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "flex w-full flex-col items-start gap-1.5 px-4 py-3 text-left text-sm hover:bg-muted/60",
                selectedId === conversation.id && "bg-muted"
              )}
            >
              <span className="text-[11px] text-muted-foreground">
                {formatLastSyncAttempt(conversation.startedAt)}
              </span>
              <p className="line-clamp-2 text-xs text-foreground">
                {truncateText(firstCustomer?.content ?? conversation.preview, 100)}
              </p>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {truncateText(firstAssistant?.content ?? "No agent reply yet", 100)}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
