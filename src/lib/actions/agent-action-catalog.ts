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
      id: "get_subscription_details",
      name: "Get subscription details",
      description: "Look up plan, status, billing amount, and renewal date.",
    },
    {
      id: "cancel_subscription",
      name: "Cancel subscription",
      description: "Schedule cancellation at the end of the current billing period.",
    },
    {
      id: "pause_subscription",
      name: "Pause subscription",
      description: "Pause billing for a preset or custom duration.",
    },
    {
      id: "resume_subscription",
      name: "Resume subscription",
      description: "Resume a paused subscription immediately.",
    },
  ],
};

CONNECTOR_ACTION_TEMPLATES.stripe_subscriptions =
  CONNECTOR_ACTION_TEMPLATES.stripe;

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
