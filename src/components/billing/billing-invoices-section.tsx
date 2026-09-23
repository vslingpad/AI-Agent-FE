"use client";

import { Loader2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBillingInvoices, useBillingPortalSession } from "@/hooks/use-billing";
import type { OrgInvoice } from "@/lib/schemas/billing";
import { cn } from "@/lib/utils";

type BillingInvoicesSectionProps = {
  isFreePlan: boolean;
};

export function BillingInvoicesSection({ isFreePlan }: BillingInvoicesSectionProps) {
  const { data, isLoading, isError, refetch } = useBillingInvoices();
  const portalSession = useBillingPortalSession();

  const openPortal = async () => {
    try {
      const session = await portalSession.mutateAsync();
      window.open(session.url, "_blank", "noopener,noreferrer");
    } catch {
      // Mutation toast is shown globally.
    }
  };

  if (isFreePlan) {
    return null;
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            View, track, and download your subscription invoices.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={portalSession.isPending}
          onClick={() => void openPortal()}
        >
          {portalSession.isPending ? <Loader2Icon className="size-4 animate-spin" /> : null}
          Stripe billing portal
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <InvoicesSkeleton /> : null}
        {isError ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">Unable to load invoice history.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : null}
        {!isLoading && !isError && data && data.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No invoices yet.
          </p>
        ) : null}
        {!isLoading && !isError && data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Invoice</th>
                  <th className="pb-2 pr-4 font-medium">Amount</th>
                  <th className="pb-2 pr-4 font-medium">Paid</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <InvoiceRow key={row.stripeInvoiceId} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function InvoiceRow({ row }: { row: OrgInvoice }) {
  const label =
    row.stripeInvoiceNumber?.trim() ||
    row.zohoInvoiceNumber?.trim() ||
    row.stripeInvoiceId.slice(0, 12);

  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-3 pr-4 font-medium tabular-nums">{label}</td>
      <td className="py-3 pr-4 tabular-nums">{formatInvoiceAmount(row.amount, row.currency)}</td>
      <td className="py-3 pr-4 text-muted-foreground">
        {row.paidAt ? formatBillingDate(row.paidAt) : "—"}
      </td>
      <td className="py-3">
        <InvoiceStatusBadge status={row.status} />
      </td>
    </tr>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const variant =
    normalized === "synced"
      ? "default"
      : normalized === "failed"
        ? "destructive"
        : "secondary";

  const label =
    normalized === "synced"
      ? "Recorded"
      : normalized === "skipped"
        ? "Paid"
        : normalized === "pending"
          ? "Processing"
          : normalized === "failed"
            ? "Sync issue"
            : status;

  return (
    <Badge variant={variant} className={cn(normalized === "synced" && "bg-emerald-600/90")}>
      {label}
    </Badge>
  );
}

function InvoicesSkeleton() {
  return (
    <div className="space-y-3 py-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function formatBillingDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatInvoiceAmount(amount: string, currency: string) {
  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return amount;
  }

  const code = (currency || "usd").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    }).format(value);
  } catch {
    return `${value} ${code}`;
  }
}
