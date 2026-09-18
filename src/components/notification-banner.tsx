"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBillingOverview } from "@/hooks/use-billing";
import type { BillingOverview } from "@/lib/schemas/billing";

const DEFAULT_ALERT_THRESHOLDS = [0.8];

type NotificationBannerProps = {
  message: ReactNode;
  onDismiss?: () => void;
};

export function NotificationBanner({ message, onDismiss }: NotificationBannerProps) {
  return (
    <div className="relative z-20 flex shrink-0 items-center justify-center border-b border-border bg-muted/50 px-12 py-2.5 text-sm">
      <p className="text-center text-muted-foreground">{message}</p>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="absolute right-4"
      >
        <XIcon />
      </Button>
    </div>
  );
}

export function UsageNotificationBanner({
  onVisibilityChange,
}: {
  onVisibilityChange: (visible: boolean) => void;
}) {
  return (
    <Show when={{ role: "org:admin" }}>
      <AdminUsageNotificationBanner onVisibilityChange={onVisibilityChange} />
    </Show>
  );
}

function AdminUsageNotificationBanner({
  onVisibilityChange,
}: {
  onVisibilityChange: (visible: boolean) => void;
}) {
  const { data } = useBillingOverview();
  const [dismissed, setDismissed] = useState(false);
  const alert = dismissed ? null : usageAlert(data);

  useEffect(() => {
    onVisibilityChange(Boolean(alert));
  }, [alert, onVisibilityChange]);

  if (!alert) {
    return null;
  }

  return (
    <NotificationBanner
      message={
        <>
          {alert.lead}{" "}
          <Link
            href={alert.href}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {alert.cta}
          </Link>{" "}
          {alert.tail}
        </>
      }
      onDismiss={() => {
        setDismissed(true);
        onVisibilityChange(false);
      }}
    />
  );
}

function usageAlert(data: BillingOverview | undefined) {
  if (!data) {
    return null;
  }

  const isFreePlan = data.subscription.tier === "free";
  const thresholds = data.settings.alertThresholds.length
    ? data.settings.alertThresholds
    : DEFAULT_ALERT_THRESHOLDS;
  const warnAt = Math.min(...thresholds);
  const percent = Math.max(0, Math.round(data.usage.usagePercent));

  if (!data.usage.canAnswer) {
    return isFreePlan
      ? {
          lead: "Production AI replies are paused. You've used all free conversations.",
          cta: "Upgrade",
          href: "/billing?upgrade=1",
          tail: "to continue answering customers.",
        }
      : {
          lead: "Production AI replies are paused. Included conversations are used up.",
          cta: "Review billing",
          href: "/billing",
          tail: "to enable overage or change your plan.",
        };
  }

  if (percent / 100 < warnAt) {
    return null;
  }

  if (isFreePlan) {
    return {
      lead:
        percent >= 100
          ? "You've used all 50 free conversations."
          : `Your free conversation usage is at ${percent}%.`,
      cta: "Upgrade your plan",
      href: "/billing?upgrade=1",
      tail: "to keep production AI running.",
    };
  }

  if (percent >= 100) {
    return {
      lead: `You've used ${percent}% of your included conversations.`,
      cta: "Review billing",
      href: "/billing",
      tail: "to enable overage or avoid interruption.",
    };
  }

  return {
    lead: `Your conversation usage is at ${percent}%.`,
    cta: "Review billing",
    href: "/billing",
    tail: "to avoid overage charges.",
  };
}
