import type {
  ConversationChannel,
  ConversationStatus,
} from "@/lib/schemas/agents";

export const CHANNEL_LABEL: Record<ConversationChannel, string> = {
  web_chat: "Web Chat",
  zendesk: "Zendesk",
  playground: "Playground",
};

export const STATUS_LABEL: Record<ConversationStatus, string> = {
  ai_active: "AI handling",
  handed_over: "Handed over",
  resolved: "Resolved",
};

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
