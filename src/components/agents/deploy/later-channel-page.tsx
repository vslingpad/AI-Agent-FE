import { AgentPageFrame } from "@/components/agents/agent-page-frame";
import { Button } from "@/components/ui/button";

export function AgentLaterChannelPage({
  channel,
}: {
  channel: "Instagram" | "WhatsApp";
}) {
  return (
    <AgentPageFrame
      title={channel}
      description={`${channel} is planned after launch. Web Chat and Zendesk Help Desk ship first.`}
    >
      <div className="flex max-w-lg flex-col gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <p className="text-sm font-medium">{channel} is not in this launch</p>
        <p className="text-sm text-muted-foreground">
          Priority P2. The agent will use the same knowledge, actions, and
          procedures once this channel is connected at the org level.
        </p>
        <Button variant="outline" disabled>
          Notify me when available
        </Button>
      </div>
    </AgentPageFrame>
  );
}
