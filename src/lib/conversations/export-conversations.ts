import type { AgentConversation } from "@/lib/schemas/agents";
import { displayDetailValue } from "@/lib/conversations/conversation-utils";

function escapeCsv(value: string | number | boolean): string {
  const stringValue = String(value);

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function appendSection(
  lines: string[],
  title: string,
  headers: string[],
  rows: (string | number | boolean)[][]
) {
  lines.push(title);
  lines.push(headers.map(escapeCsv).join(","));
  rows.forEach((row) => {
    lines.push(row.map(escapeCsv).join(","));
  });
  lines.push("");
}

export function conversationsToCsv(conversations: AgentConversation[]) {
  const lines: string[] = [];

  appendSection(
    lines,
    "Conversations",
    [
      "id",
      "channel",
      "status",
      "customerName",
      "customerEmail",
      "location",
      "startedAt",
      "messageCount",
      "billable",
      "knowledgeGap",
      "preview",
    ],
    conversations.map((conversation) => [
      conversation.id,
      conversation.channel,
      conversation.status,
      displayDetailValue(conversation.customerName),
      displayDetailValue(conversation.customerEmail),
      displayDetailValue(conversation.location),
      conversation.startedAt,
      conversation.messageCount,
      conversation.billable,
      conversation.knowledgeGap,
      conversation.preview,
    ])
  );

  return lines.join("\n");
}

export function conversationTranscriptToCsv(conversation: AgentConversation) {
  const lines: string[] = [];

  appendSection(
    lines,
    "Conversation metadata",
    ["field", "value"],
    [
      ["id", conversation.id],
      ["channel", conversation.channel],
      ["status", conversation.status],
      ["customerName", displayDetailValue(conversation.customerName)],
      ["customerEmail", displayDetailValue(conversation.customerEmail)],
      ["location", displayDetailValue(conversation.location)],
      ["startedAt", conversation.startedAt],
      ["messageCount", conversation.messageCount],
      ["billable", conversation.billable],
      ["knowledgeGap", conversation.knowledgeGap],
    ]
  );

  appendSection(
    lines,
    "Messages",
    ["role", "content", "at"],
    conversation.messages.map((message) => [
      message.role,
      message.content,
      message.at,
    ])
  );

  return lines.join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
