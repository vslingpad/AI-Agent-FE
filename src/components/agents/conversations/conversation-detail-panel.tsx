"use client";

import { useState } from "react";
import { DownloadIcon } from "lucide-react";
import { ConversationChatTab } from "@/components/agents/conversations/conversation-chat-tab";
import { ConversationDetailsTab } from "@/components/agents/conversations/conversation-details-tab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  conversationTranscriptToCsv,
  downloadCsv,
} from "@/lib/conversations/export-conversations";
import type { AgentConversation } from "@/lib/schemas/agents";

type ConversationDetailPanelProps = {
  conversation: AgentConversation;
  agentName?: string;
  onReviseAnswer: (input: {
    question: string;
    answer: string;
    title: string;
  }) => void;
};

type DetailTab = "chat" | "details";

export function ConversationDetailPanel({
  conversation,
  agentName,
  onReviseAnswer,
}: ConversationDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("chat");

  const handleExport = () => {
    downloadCsv(
      `conversation-${conversation.id}.csv`,
      conversationTranscriptToCsv(conversation)
    );
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as DetailTab)}
      className="flex min-h-0 min-w-0 flex-1 flex-col"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <DownloadIcon className="size-4" />
        </Button>
      </div>

      <TabsContent value="chat" className="mt-0 flex min-h-0 flex-1 flex-col">
        <ConversationChatTab
          conversation={conversation}
          agentName={agentName}
          onReviseAnswer={onReviseAnswer}
        />
      </TabsContent>
      <TabsContent value="details" className="mt-0 flex min-h-0 flex-1 flex-col">
        <ConversationDetailsTab conversation={conversation} />
      </TabsContent>
    </Tabs>
  );
}
