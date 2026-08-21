import { ArrowRightIcon } from "lucide-react";
import { TrendIndicator } from "@/components/dashboard/trend-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CountryTicketRow } from "@/lib/schemas/dashboard";

type CountryTicketsTableProps = {
  rows: CountryTicketRow[];
  comparisonLabel: string;
};

export function CountryTicketsTable({
  rows,
  comparisonLabel,
}: CountryTicketsTableProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Country level AI-handled tickets</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Country</th>
                <th className="pb-3 pr-4 font-medium">AI-handled tickets</th>
                <th className="pb-3 font-medium">vs {comparisonLabel}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.country} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-4 font-medium">{row.country}</td>
                  <td className="py-3 pr-4 tabular-nums">{row.tickets}</td>
                  <td className="py-3">
                    <TrendIndicator
                      change={row.changePercent}
                      label=""
                      direction={row.direction}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button variant="link" className="h-auto p-0 text-sm">
          View all countries
          <ArrowRightIcon className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function CountryTicketsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Country level AI-handled tickets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-8 animate-pulse rounded bg-muted" />
        ))}
      </CardContent>
    </Card>
  );
}
