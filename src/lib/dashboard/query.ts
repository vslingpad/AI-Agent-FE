import {
  ChartPeriodSchema,
  DATE_ONLY_RE,
  type ChartPeriod,
  type DashboardQueryParams,
} from "@/lib/schemas/dashboard";

export const DEFAULT_DASHBOARD_PERIOD: ChartPeriod = "7d";

export const DASHBOARD_PERIOD_OPTIONS: { value: ChartPeriod; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

function isDashboardTimestamp(value: string) {
  return DATE_ONLY_RE.test(value) || !Number.isNaN(Date.parse(value));
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function parseDateOnly(date: string): { year: number; month: number; day: number } | null {
  if (!DATE_ONLY_RE.test(date)) {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

/** Calendar date (YYYY-MM-DD) in the user's local timezone for `<input type="date">`. */
export function toLocalDateInput(value?: string): string {
  if (!value) {
    return "";
  }

  if (DATE_ONLY_RE.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return [
    parsed.getFullYear(),
    padDatePart(parsed.getMonth() + 1),
    padDatePart(parsed.getDate()),
  ].join("-");
}

/** Local midnight (`00:00:00.000`) converted to UTC ISO. */
export function localStartOfDayToUtcIso(date: string): string {
  const parts = parseDateOnly(date);
  if (!parts) {
    return date;
  }

  return new Date(parts.year, parts.month - 1, parts.day, 0, 0, 0, 0).toISOString();
}

/** Local end of day (`23:59:59.999`) converted to UTC ISO. */
export function localEndOfDayToUtcIso(date: string): string {
  const parts = parseDateOnly(date);
  if (!parts) {
    return date;
  }

  return new Date(parts.year, parts.month - 1, parts.day, 23, 59, 59, 999).toISOString();
}

export function parseDashboardScope(
  searchParams: URLSearchParams
): DashboardQueryParams {
  const dateFromRaw = searchParams.get("dateFrom") ?? undefined;
  const dateToRaw = searchParams.get("dateTo") ?? undefined;
  const dateFrom =
    dateFromRaw && isDashboardTimestamp(dateFromRaw)
      ? DATE_ONLY_RE.test(dateFromRaw)
        ? localStartOfDayToUtcIso(dateFromRaw)
        : dateFromRaw
      : undefined;
  const dateTo =
    dateToRaw && isDashboardTimestamp(dateToRaw)
      ? DATE_ONLY_RE.test(dateToRaw)
        ? localEndOfDayToUtcIso(dateToRaw)
        : dateToRaw
      : undefined;
  const hasCustomRange = Boolean(dateFrom || dateTo);
  const period = ChartPeriodSchema.safeParse(searchParams.get("period"));
  const agentId = searchParams.get("agentId")?.trim() || undefined;

  return {
    period: period.success ? period.data : hasCustomRange ? undefined : DEFAULT_DASHBOARD_PERIOD,
    agentId,
    dateFrom,
    dateTo,
  };
}

export function applyDashboardScope(
  params: URLSearchParams,
  query: DashboardQueryParams
) {
  if (query.dateFrom) {
    params.set("dateFrom", query.dateFrom);
  }

  if (query.dateTo) {
    params.set("dateTo", query.dateTo);
  }

  if (
    !query.dateFrom &&
    !query.dateTo &&
    query.period &&
    query.period !== DEFAULT_DASHBOARD_PERIOD
  ) {
    params.set("period", query.period);
  }

  if (query.agentId) {
    params.set("agentId", query.agentId);
  }
}

export function toDashboardSearchParams(query: DashboardQueryParams) {
  const params = new URLSearchParams();
  applyDashboardScope(params, query);
  return params;
}

export function dashboardHref(path: string, query: DashboardQueryParams) {
  const qs = toDashboardSearchParams(query).toString();
  return qs ? `${path}?${qs}` : path;
}

export function isCustomDashboardRange(query: DashboardQueryParams) {
  return Boolean(query.dateFrom || query.dateTo);
}

function formatLocalDay(value: string) {
  const day = toLocalDateInput(value);
  const parts = parseDateOnly(day);
  if (!parts) {
    return value;
  }

  return new Date(parts.year, parts.month - 1, parts.day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function dashboardDateButtonLabel(
  query: DashboardQueryParams,
  apiLabel?: string
) {
  if (query.dateFrom && query.dateTo) {
    return `${formatLocalDay(query.dateFrom)} – ${formatLocalDay(query.dateTo)}`;
  }

  if (query.dateFrom) {
    return `${formatLocalDay(query.dateFrom)} – now`;
  }

  if (query.dateTo) {
    return `Through ${formatLocalDay(query.dateTo)}`;
  }

  return (
    apiLabel ??
    DASHBOARD_PERIOD_OPTIONS.find(
      (item) => item.value === (query.period ?? DEFAULT_DASHBOARD_PERIOD)
    )?.label ?? "7D"
  );
}
