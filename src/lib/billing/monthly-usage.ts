import type { MonthlyConversationUsagePoint } from "@/lib/schemas/billing";

export type MonthRange = {
  start: string;
  end: string;
};

const MONTHLY_USAGE_PATTERN = [
  { included: 680, overage: 0 },
  { included: 812, overage: 24 },
  { included: 945, overage: 55 },
  { included: 1000, overage: 118 },
  { included: 892, overage: 46 },
  { included: 756, overage: 18 },
  { included: 620, overage: 0 },
  { included: 540, overage: 12 },
  { included: 710, overage: 32 },
  { included: 880, overage: 41 },
  { included: 960, overage: 68 },
  { included: 1000, overage: 95 },
];

export function getDefaultUsageRange(referenceDate = new Date()): MonthRange {
  const year = referenceDate.getFullYear();

  return {
    start: `${year}-01`,
    end: `${year}-12`,
  };
}

export function formatMonthInputValue(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseMonthInputValue(value: string) {
  const [year, month] = value.split("-").map(Number);

  return {
    year,
    month,
  };
}

export function compareMonthKeys(left: string, right: string) {
  return left.localeCompare(right);
}

export function filterUsagePointsByRange(
  points: MonthlyConversationUsagePoint[],
  range: MonthRange
) {
  return points.filter(
    (point) =>
      compareMonthKeys(point.month, range.start) >= 0 &&
      compareMonthKeys(point.month, range.end) <= 0
  );
}

export function buildMonthlyConversationUsage(
  currentIncluded: number,
  currentOverage: number,
  monthsBack = 24
): MonthlyConversationUsagePoint[] {
  const now = new Date();
  const points: MonthlyConversationUsagePoint[] = [];

  for (let offset = monthsBack - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const isCurrentMonth = offset === 0;
    const pattern = MONTHLY_USAGE_PATTERN[offset % MONTHLY_USAGE_PATTERN.length];
    const included = isCurrentMonth ? currentIncluded : pattern.included;
    const overage = isCurrentMonth ? currentOverage : pattern.overage;

    points.push({
      month: formatMonthInputValue(date.getFullYear(), date.getMonth() + 1),
      label: date.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
      included,
      overage,
      total: included + overage,
    });
  }

  return points;
}

export function clampUsageRange(range: MonthRange): MonthRange {
  if (compareMonthKeys(range.start, range.end) <= 0) {
    return range;
  }

  return {
    start: range.end,
    end: range.start,
  };
}
