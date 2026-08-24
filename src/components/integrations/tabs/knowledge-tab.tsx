"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatConnectedDate } from "@/lib/integrations/connector-paths";
import type { ConnectorDetail } from "@/lib/schemas/integrations";

type KnowledgeTabProps = {
  connector: ConnectorDetail;
};

const ARTICLE_STATUS: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" | "muted" }
> = {
  indexed: { label: "Indexed", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  failed: { label: "Failed", variant: "destructive" },
};

export function KnowledgeTab({ connector }: KnowledgeTabProps) {
  const knowledge = connector.knowledge;

  if (!knowledge) {
    return (
      <Card className="w-full max-w-6xl">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Knowledge capability is not enabled for this connection.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total articles" value={knowledge.totalArticles.toLocaleString()} />
        <StatCard label="Indexed" value={knowledge.indexedArticles.toLocaleString()} />
        <StatCard
          label="Collections"
          value={knowledge.collections.length.toString()}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-lg border border-border">
            {knowledge.collections.map((collection) => (
              <div
                key={collection.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{collection.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {collection.articleCount.toLocaleString()} articles
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {collection.lastSyncedAt
                    ? formatConnectedDate(collection.lastSyncedAt)
                    : "Never synced"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Synced articles</CardTitle>
          <p className="text-sm text-muted-foreground">
            Training status for Help Center content indexed for agent retrieval.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Article</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium">Words</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Last trained</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {knowledge.articles.map((article) => {
                  const status = ARTICLE_STATUS[article.status] ?? {
                    label: article.status,
                    variant: "muted" as const,
                  };

                  return (
                    <tr key={article.id}>
                      <td className="py-3 pr-4 font-medium">{article.title}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {article.category}
                      </td>
                      <td className="py-3 pr-4 tabular-nums text-muted-foreground">
                        {article.wordCount}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {article.lastTrainedAt
                          ? formatConnectedDate(article.lastTrainedAt)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
