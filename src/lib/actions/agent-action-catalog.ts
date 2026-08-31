export type AgentActionTemplate = {
  id: string;
  name: string;
  description: string;
};

export const CONNECTOR_ACTION_TEMPLATES: Record<string, AgentActionTemplate[]> = {
  zendesk: [
    {
      id: "zd_tag_ticket",
      name: "Tag ticket",
      description: "Add tags to a Support ticket during or after a conversation.",
    },
    {
      id: "zd_assign_ticket",
      name: "Assign ticket",
      description: "Assign a ticket to a group or agent on escalation.",
    },
    {
      id: "zd_internal_note",
      name: "Add internal note",
      description: "Post an internal note with AI summary on handover.",
    },
    {
      id: "zd_pass_control",
      name: "Pass control (Messaging)",
      description: "Hand off a Messaging conversation to a human agent queue.",
    },
  ],
  calendly: [
    {
      id: "cal_schedule",
      name: "Schedule meeting",
      description: "Book a meeting using a configured event type.",
    },
    {
      id: "cal_availability",
      name: "Check availability",
      description: "Look up open slots for a given event type.",
    },
    {
      id: "cal_cancel",
      name: "Cancel event",
      description: "Cancel a scheduled Calendly event on behalf of the customer.",
    },
  ],
  stripe: [
    {
      id: "stripe_lookup_sub",
      name: "Lookup subscription",
      description: "Retrieve subscription status and plan details.",
    },
    {
      id: "stripe_portal_link",
      name: "Customer portal link",
      description: "Generate a Stripe Customer Portal session link.",
    },
    {
      id: "stripe_refund",
      name: "Issue refund",
      description:
        "Process a refund — requires policy approval and confirmation.",
    },
  ],
};

export function templateSubActions(
  slug: string,
  enabledById: Record<string, boolean> = {}
) {
  const templates = CONNECTOR_ACTION_TEMPLATES[slug] ?? [];

  return templates.map((template) => ({
    ...template,
    enabled: enabledById[template.id] ?? false,
  }));
}
