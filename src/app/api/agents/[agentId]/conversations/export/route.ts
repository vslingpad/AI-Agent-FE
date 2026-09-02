import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/auth";
import { ConversationQuerySchema } from "@/lib/schemas/agents";
import {
  agentNotFound,
  withAgentId,
  type AgentRouteContext,
} from "@/lib/api/agent-routes";
import { conversationsToCsv } from "@/lib/conversations/export-conversations";
import { exportAgentConversations } from "@/lib/fixtures/agents-store";

export async function GET(request: Request, context: AgentRouteContext) {
  return withAgentId(context, async (orgId, agentId) => {
    const searchParams = new URL(request.url).searchParams;
    const parsed = ConversationQuerySchema.safeParse({
      customer: searchParams.get("customer") ?? undefined,
      conversationId: searchParams.get("conversationId") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      channel: searchParams.get("channel") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      billable: searchParams.get("billable") ?? undefined,
      knowledgeGap: searchParams.get("knowledgeGap") ?? undefined,
    });

    if (!parsed.success) {
      return apiError("Invalid query parameters");
    }

    const { page: _page, pageSize: _pageSize, ...filters } = parsed.data;
    const exportData = exportAgentConversations(orgId, agentId, filters);

    if (!exportData) {
      return agentNotFound();
    }

    const csv = conversationsToCsv(exportData.conversations);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="conversations-export.csv"',
      },
    });
  });
}
