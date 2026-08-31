export type AgentNavLeaf = {
  id: string;
  label: string;
  segment: string;
  note?: string;
};

export type AgentNavGroup = {
  id: string;
  label: string;
  href?: string;
  children?: AgentNavLeaf[];
};

export const AGENT_NAV: AgentNavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    href: "analytics",
  },
  {
    id: "build",
    label: "Build",
    children: [
      { id: "knowledge", label: "Knowledge", segment: "build/knowledge" },
      { id: "actions", label: "Actions", segment: "build/actions" },
      { id: "procedures", label: "Procedures", segment: "build/procedures" },
    ],
  },
  {
    id: "test",
    label: "Test",
    children: [
      { id: "playground", label: "Playground", segment: "test/playground" },
    ],
  },
  {
    id: "deploy",
    label: "Deploy",
    children: [
      { id: "web-chat", label: "Web Chat", segment: "deploy/web-chat" },
      {
        id: "help-desk",
        label: "Help Desk",
        segment: "deploy/help-desk",
        note: "Zendesk",
      },
    ],
  },
  {
    id: "conversations",
    label: "Conversations",
    href: "conversations",
  },
  {
    id: "improve",
    label: "Improve",
    children: [
      {
        id: "knowledge-gap",
        label: "Knowledge Gap",
        segment: "improve/knowledge-gap",
      },
      {
        id: "knowledge-conflict",
        label: "Knowledge Conflict",
        segment: "improve/knowledge-conflict",
      },
      {
        id: "duplicate-content",
        label: "Duplicate Content",
        segment: "improve/duplicate-content",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    href: "settings",
  },
];

export function agentPath(agentId: string, segment = "analytics") {
  return `/agents/${agentId}/${segment}`;
}
