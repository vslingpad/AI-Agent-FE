"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChevronDownIcon,
  DownloadIcon,
  Loader2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/ui/table-pagination";
import { useBillingInvoices } from "@/hooks/use-billing";
import { getBillingInvoiceViewUrl } from "@/lib/api/billing";
import type { OrgInvoice } from "@/lib/schemas/billing";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type DateRange = { paidFrom?: string; paidTo?: string };

export function BillingInvoicesPage() {
  return (
    <Show
      when={{ role: "org:admin" }}
      fallback={
        <InvoicesPageShell>
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm font-medium">Admin access required</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Only organization admins can view invoices.
            </p>
          </div>
        </InvoicesPageShell>
      }
    >
      <BillingInvoicesPageContent />
    </Show>
  );
}

function BillingInvoicesPageContent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [dateRange, setDateRange] = useState<DateRange>({});
  const { data, isLoading, isError, refetch } = useBillingInvoices({
    page,
    pageSize,
    paidFrom: dateRange.paidFrom,
    paidTo: dateRange.paidTo,
  });

  const pagination = data?.pagination;
  const items = data?.items ?? [];
  const dateLabel = useMemo(() => formatDateRangeLabel(dateRange), [dateRange]);

  return (
    <InvoicesPageShell
      dateLabel={dateLabel}
      dateRange={dateRange}
      onDateRangeApply={(next) => {
        setDateRange(next);
        setPage(1);
      }}
    >
      <Card className="border-border">
        <CardContent className="p-0">
          {isLoading ? <InvoicesTableSkeleton /> : null}
          {isError ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">Unable to load invoices.</p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Try again
              </Button>
            </div>
          ) : null}
          {!isLoading && !isError && items.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center px-6 py-12">
              <p className="text-sm text-muted-foreground">
                No paid invoices in this date range.
              </p>
            </div>
          ) : null}
          {!isLoading && !isError && items.length > 0 && pagination ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-xl text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Invoice</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <InvoiceTableRow key={row.stripeInvoiceId} row={row} />
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                page={pagination.page}
                totalPages={Math.max(1, pagination.totalPages)}
                totalItems={pagination.totalItems}
                pageStart={(pagination.page - 1) * pagination.pageSize}
                pageSize={pagination.pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </>
          ) : null}
        </CardContent>
      </Card>
    </InvoicesPageShell>
  );
}

function InvoicesPageShell({
  children,
  dateLabel,
  dateRange,
  onDateRangeApply,
}: {
  children: ReactNode;
  dateLabel?: string;
  dateRange?: DateRange;
  onDateRangeApply?: (range: DateRange) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <div className="max-w-5xl space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit gap-1 px-2"
            render={<Link href="/billing" />}
          >
            <ArrowLeftIcon className="size-4" />
            Back to billing
          </Button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">Invoices</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Paid subscription invoices recorded in your account.
            </p>
          </div>
          {dateLabel !== undefined && dateRange && onDateRangeApply ? (
            <InvoiceDateRangeFilter
              label={dateLabel}
              range={dateRange}
              onApply={onDateRangeApply}
            />
          ) : null}
        </div>
      </div>
      <div className="max-w-5xl">{children}</div>
    </div>
  );
}

function InvoiceDateRangeFilter({
  label,
  range,
  onApply,
}: {
  label: string;
  range: DateRange;
  onApply: (range: DateRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(range.paidFrom ?? "");
  const [draftTo, setDraftTo] = useState(range.paidTo ?? "");
  const inverted = Boolean(draftFrom && draftTo && draftFrom > draftTo);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setDraftFrom(range.paidFrom ?? "");
          setDraftTo(range.paidTo ?? "");
        }
        setOpen(nextOpen);
      }}
    >
      <PopoverTrigger render={<Button variant="outline" size="sm" className="gap-2 shrink-0" />}>
        <CalendarIcon className="size-4" />
        {label}
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 gap-3 p-3">
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="invoice-paid-from">From</Label>
            <Input
              id="invoice-paid-from"
              type="date"
              value={draftFrom}
              onChange={(event) => setDraftFrom(event.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="invoice-paid-to">To</Label>
            <Input
              id="invoice-paid-to"
              type="date"
              value={draftTo}
              onChange={(event) => setDraftTo(event.target.value)}
            />
          </div>
          {inverted ? (
            <p className="text-xs text-destructive">Start date must be on or before end date.</p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              disabled={inverted}
              onClick={() => {
                onApply({
                  paidFrom: draftFrom || undefined,
                  paidTo: draftTo || undefined,
                });
                setOpen(false);
              }}
            >
              Apply
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraftFrom("");
                setDraftTo("");
                onApply({});
                setOpen(false);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function InvoiceTableRow({ row }: { row: OrgInvoice }) {
  const [opening, setOpening] = useState(false);
  const invoiceLabel =
    row.zohoInvoiceNumber?.trim() || row.stripeInvoiceNumber?.trim() || row.stripeInvoiceId;

  const openInvoice = async () => {
    setOpening(true);
    try {
      const { url } = await getBillingInvoiceViewUrl(row.stripeInvoiceId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not open invoice");
    } finally {
      setOpening(false);
    }
  };

  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="px-4 py-3 font-medium tabular-nums">{invoiceLabel}</td>
      <td className="px-4 py-3 tabular-nums">{formatInvoiceAmount(row.amount, row.currency)}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {row.paidAt ? formatBillingDate(row.paidAt) : "—"}
      </td>
      <td className="px-4 py-3">
        <Badge variant="default" className={cn("bg-emerald-600/90")}>
          Paid
        </Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant="outline"
          size="sm"
          disabled={opening}
          onClick={() => void openInvoice()}
        >
          {opening ? <Loader2Icon className="size-4 animate-spin" /> : <DownloadIcon className="size-4" />}
          Download
        </Button>
      </td>
    </tr>
  );
}

function InvoicesTableSkeleton() {
  return (
    <div className="space-y-3 px-4 py-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function formatDateRangeLabel(range: DateRange) {
  if (range.paidFrom && range.paidTo) {
    return `${formatShortDate(range.paidFrom)} – ${formatShortDate(range.paidTo)}`;
  }
  if (range.paidFrom) {
    return `From ${formatShortDate(range.paidFrom)}`;
  }
  if (range.paidTo) {
    return `Until ${formatShortDate(range.paidTo)}`;
  }
  return "All dates";
}

function formatShortDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
