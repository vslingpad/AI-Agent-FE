"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  CHANNEL_LABEL,
  STATUS_LABEL,
} from "@/components/agents/conversations/conversation-labels";
import { displayDetailValue } from "@/lib/conversations/conversation-utils";
import { formatLastSyncAttempt } from "@/lib/integrations/connector-paths";
import type { AgentConversation } from "@/lib/schemas/agents";

type ConversationDetailsTabProps = {
  conversation: AgentConversation;
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[10rem_1fr]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export function ConversationDetailsTab({ conversation }: ConversationDetailsTabProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <dl className="rounded-xl border border-border px-4">
        <DetailRow
          label="Customer name"
          value={displayDetailValue(conversation.customerName)}
        />
        <DetailRow
          label="Customer email"
          value={displayDetailValue(conversation.customerEmail)}
        />
        <DetailRow
          label="Location"
          value={displayDetailValue(conversation.location)}
        />
        <DetailRow label="Channel" value={CHANNEL_LABEL[conversation.channel]} />
        <DetailRow
          label="Status"
          value={
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
          }
        />
        <DetailRow
          label="Started"
          value={formatLastSyncAttempt(conversation.startedAt)}
        />
        <DetailRow label="Messages" value={conversation.messageCount} />
        <DetailRow
          label="Billable"
          value={conversation.billable ? "Yes" : "No"}
        />
        <DetailRow
          label="Knowledge gap"
          value={conversation.knowledgeGap ? "Yes" : "No"}
        />
        <DetailRow
          label="Conversation ID"
          value={<code className="text-xs">{conversation.id}</code>}
        />
      </dl>
    </div>
  );
}
