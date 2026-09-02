"use client";

import { ChatMessageContent } from "@/components/agents/test/playground/chat-message-content";
import { Button } from "@/components/ui/button";
import { precedingCustomerMessage } from "@/lib/conversations/conversation-utils";
import type { AgentConversation, ConversationMessage } from "@/lib/schemas/agents";
import { cn } from "@/lib/utils";

type ConversationChatTabProps = {
  conversation: AgentConversation;
  agentName?: string;
  onReviseAnswer: (input: {
    question: string;
    answer: string;
    title: string;
  }) => void;
};

function formatMessageTime(at: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(at));
}

function ConversationMessageBubble({
  message,
  agentName,
  customerMessage,
  onReviseAnswer,
}: {
  message: ConversationMessage;
  agentName: string;
  customerMessage: ConversationMessage | null;
  onReviseAnswer: ConversationChatTabProps["onReviseAnswer"];
}) {
  const isCustomer = message.role === "customer";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1",
        isCustomer ? "items-end pl-20" : "items-start pr-20"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 text-[11px] text-muted-foreground",
          isCustomer && "flex-row-reverse"
        )}
      >
        <span>{isCustomer ? "Customer" : agentName}</span>
        <span>{formatMessageTime(message.at)}</span>
      </div>

      <div
        className={cn(
          "max-w-full px-3 py-2",
          isCustomer
            ? "rounded-2xl rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-2xl rounded-bl-sm bg-muted text-foreground"
        )}
      >
        <ChatMessageContent content={message.content} inverted={isCustomer} />
      </div>

      {!isCustomer && customerMessage ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground"
          onClick={() =>
            onReviseAnswer({
              question: customerMessage.content,
              answer: message.content,
              title: "",
            })
          }
        >
          Revise answer
        </Button>
      ) : null}
    </div>
  );
}

export function ConversationChatTab({
  conversation,
  agentName = "Agent",
  onReviseAnswer,
}: ConversationChatTabProps) {
  const chatMessages = conversation.messages.filter(
    (message) => message.role !== "system"
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-muted/20">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {chatMessages.map((message) => {
          const messageIndex = conversation.messages.findIndex(
            (item) => item.id === message.id
          );
          const customerMessage =
            message.role === "assistant"
              ? precedingCustomerMessage(conversation.messages, messageIndex)
              : null;

          return (
            <ConversationMessageBubble
              key={message.id}
              message={message}
              agentName={agentName}
              customerMessage={customerMessage}
              onReviseAnswer={onReviseAnswer}
            />
          );
        })}
      </div>
    </div>
  );
}
