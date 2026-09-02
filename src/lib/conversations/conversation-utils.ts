import type { ConversationMessage } from "@/lib/schemas/agents";

export function conversationSnippets(messages: ConversationMessage[]) {
  const firstCustomer = messages.find((message) => message.role === "customer");
  const firstAssistant = messages.find((message) => message.role === "assistant");
  return { firstCustomer, firstAssistant };
}

export function precedingCustomerMessage(
  messages: ConversationMessage[],
  assistantIndex: number
) {
  for (let index = assistantIndex - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "customer") {
      return message;
    }
  }

  return null;
}

export function truncateText(text: string, maxLength = 120) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}…`;
}

export function displayDetailValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "-";
}

export const CONVERSATION_LOCATION_NONE = "__none__";
