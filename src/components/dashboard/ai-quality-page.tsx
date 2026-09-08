"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { TrendIndicator } from "@/components/dashboard/trend-indicator";
import {
  DashboardPeriodToggle,
  DashboardSubpageError,
  DashboardSubpageHeader,
} from "@/components/dashboard/dashboard-subpage-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  useDashboardAiQuality,
  useDashboardAiQualityConversations,
} from "@/hooks/use-dashboard";
import { CHANNEL_LABEL } from "@/components/agents/conversations/conversation-labels";
import { formatLastSyncAttempt } from "@/lib/integrations/connector-paths";
import { agentPath } from "@/lib/navigation/agent-sections";
import {
  ChartPeriodSchema,
  DASHBOARD_PAGE_SIZE_OPTIONS,
  type ChartPeriod,
  type DashboardAiQualityConversationsQuery,
} from "@/lib/schemas/dashboard";
import { cn } from "@/lib/utils";

function parseQuery(
  searchParams: URLSearchParams
): { period: ChartPeriod } & DashboardAiQualityConversationsQuery {
  const period = ChartPeriodSchema.safeParse(searchParams.get("period") ?? "30d");
  const pageParam = Number(searchParams.get("page"));
  const pageSizeParam = Number(searchParams.get("pageSize"));

  return {
    period: period.success ? period.data : "30d",
    page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
    pageSize: DASHBOARD_PAGE_SIZE_OPTIONS.includes(
      pageSizeParam as (typeof DASHBOARD_PAGE_SIZE_OPTIONS)[number]
    )
      ? pageSizeParam
      : 20,
  };
}

function toSearchParams(query: {
  period: ChartPeriod;
  page: number;
  pageSize: number;
}) {
  const params = new URLSearchParams();

  if (query.period !== "30d") {
    params.set("period", query.period);
  }

  if (query.page > 1) {
    params.set("page", String(query.page));
  }

  if (query.pageSize !== 20) {
    params.set("pageSize", String(query.pageSize));
  }

  return params;
}

export function AiQualityPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseQuery(searchParams), [searchParams]);
  const qualityQuery = useDashboardAiQuality({ period: query.period });
  const conversationsQuery = useDashboardAiQualityConversations(query);

  const updateQuery = (next: typeof query) => {
    const params = toSearchParams(next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  if (!qualityQuery.data) {
    if (qualityQuery.isError) {
      return (
        <DashboardSubpageError
          message="Unable to load AI quality data."
          onRetry={() => qualityQuery.refetch()}
        />
      );
    }

    return <AiQualityPageSkeleton />;
  }

  const { quality, comparisonLabel } = qualityQuery.data;
  const dist = quality.confidenceDistribution;
  const conversations = conversationsQuery.data?.conversations ?? [];
  const pagination = conversationsQuery.data?.pagination;
  const pageStart = pagination
    ? (pagination.page - 1) * pagination.pageSize
    : 0;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <DashboardSubpageHeader
        title="AI quality"
        description="Answer confidence, knowledge grounding, and the conversations that need review."
        actions={
          <DashboardPeriodToggle
            value={query.period}
            onChange={(period) => updateQuery({ ...query, period, page: 1 })}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Avg. answer confidence</p>
            <p className="text-3xl font-semibold tabular-nums">
              {quality.avgConfidence}%
            </p>
            <p className="text-xs text-muted-foreground">vs {comparisonLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Low-confidence answers</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-semibold tabular-nums">
                {quality.lowConfidenceRate}%
              </p>
              <TrendIndicator
                change={quality.lowConfidenceChange}
                label=""
                direction={quality.lowConfidenceDirection}
                invertColors
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Knowledge-grounded answers
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-semibold tabular-nums">
                {quality.knowledgeGroundedRate}%
              </p>
              <TrendIndicator
                change={quality.knowledgeGroundedChange}
                label=""
                direction={quality.knowledgeGroundedDirection}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Confidence distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-3 overflow-hidden rounded-full">
            <div
              className="bg-emerald-500"
              style={{ width: `${dist.high}%` }}
              title={`High: ${dist.high}%`}
            />
            <div
              className="bg-amber-400"
              style={{ width: `${dist.medium}%` }}
              title={`Medium: ${dist.medium}%`}
            />
            <div
              className="bg-red-400"
              style={{ width: `${dist.low}%` }}
              title={`Low: ${dist.low}%`}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <DistributionStat
              label="High (≥80%)"
              value={dist.high}
              className="text-emerald-600"
            />
            <DistributionStat
              label="Medium (50–80%)"
              value={dist.medium}
              className="text-amber-600"
            />
            <DistributionStat
              label="Low (<50%)"
              value={dist.low}
              className="text-red-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "overflow-hidden py-0",
          conversationsQuery.isFetching && "opacity-70"
        )}
      >
        <CardHeader className="px-5 pt-5">
          <CardTitle>
            {quality.lowConfidenceConversationCount} low-confidence conversations
          </CardTitle>
        </CardHeader>
        {conversationsQuery.isError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10">
            <p className="text-sm text-muted-foreground">
              Unable to load low-confidence conversations.
            </p>
            <Button variant="outline" onClick={() => conversationsQuery.refetch()}>
              Try again
            </Button>
          </div>
        ) : !pagination ? (
          <div className="space-y-3 px-5 pb-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border text-left text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Conversation</th>
                    <th className="px-5 py-3 font-medium">Agent</th>
                    <th className="px-5 py-3 font-medium">Country</th>
                    <th className="px-5 py-3 font-medium">Channel</th>
                    <th className="px-5 py-3 font-medium">Confidence</th>
                    <th className="px-5 py-3 font-medium">
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.map((conversation) => (
                    <tr
                      key={conversation.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="max-w-sm px-5 py-3">
                        <p className="font-medium">
                          {conversation.customerName ?? "Unknown customer"}
                        </p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {conversation.preview}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatLastSyncAttempt(conversation.startedAt)}
                        </p>
                      </td>
                      <td className="px-5 py-3">{conversation.agentName}</td>
                      <td className="px-5 py-3">{conversation.country}</td>
                      <td className="px-5 py-3">
                        {CHANNEL_LABEL[conversation.channel]}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="destructive">
                          {conversation.confidence}%
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0"
                          render={
                            <Link
                              href={`${agentPath(conversation.agentId, "conversations")}?conversationId=${conversation.id}`}
                            />
                          }
                        >
                          Open
                          <ArrowRightIcon className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageStart={pageStart}
              pageSize={pagination.pageSize}
              pageSizeOptions={DASHBOARD_PAGE_SIZE_OPTIONS}
              onPageChange={(page) => updateQuery({ ...query, page })}
              onPageSizeChange={(pageSize) =>
                updateQuery({ ...query, pageSize, page: 1 })
              }
            />
          </>
        )}
      </Card>
    </div>
  );
}

function DistributionStat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold tabular-nums ${className}`}>{value}%</p>
    </div>
  );
}

export function AiQualityPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
