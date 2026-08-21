import type { TrendDirection } from "@/lib/schemas/dashboard";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";

type TrendIndicatorProps = {
  change: number;
  label: string;
  direction: TrendDirection;
  format?: "percent" | "number";
  invertColors?: boolean;
  className?: string;
};

export function TrendIndicator({
  change,
  label,
  direction,
  format = "percent",
  invertColors = false,
  className,
}: TrendIndicatorProps) {
  const formattedChange =
    format === "percent"
      ? `${Math.abs(change)}%`
      : String(Math.abs(change));

  const isPositive = direction === "up";
  const isNegative = direction === "down";
  const good =
    invertColors ? isNegative : isPositive;
  const bad =
    invertColors ? isPositive : isNegative;

  return (
    <p className={cn("flex items-center gap-1 text-xs", className)}>
      {direction === "up" ? (
        <ArrowUpIcon
          className={cn("size-3", good ? "text-emerald-600" : "text-red-500")}
        />
      ) : direction === "down" ? (
        <ArrowDownIcon
          className={cn("size-3", bad ? "text-red-500" : "text-emerald-600")}
        />
      ) : (
        <MinusIcon className="size-3 text-muted-foreground" />
      )}
      <span
        className={cn(
          good && "text-emerald-600",
          bad && "text-red-500",
          direction === "neutral" && "text-muted-foreground"
        )}
      >
        {formattedChange}
      </span>
      <span className="text-muted-foreground">{label}</span>
    </p>
  );
}
