import { Badge } from "@/components/ui/badge";
import type { AgentStatus } from "@/lib/schemas/agents";

export function AgentStatusBadge({
  status,
  unpublished,
}: {
  status: AgentStatus;
  unpublished?: boolean;
}) {
  if (status === "live" && unpublished) {
    return <Badge variant="warning">Unpublished changes</Badge>;
  }

  if (status === "live") {
    return <Badge variant="success">Live</Badge>;
  }

  return <Badge variant="muted">Draft</Badge>;
}
