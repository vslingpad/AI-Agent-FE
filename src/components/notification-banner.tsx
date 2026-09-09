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
            href="/billing"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Upgrade your plan
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

  const thresholds = data.settings.alertThresholds.length
    ? data.settings.alertThresholds
    : DEFAULT_ALERT_THRESHOLDS;
  const warnAt = Math.min(...thresholds);
  const percent = Math.max(0, Math.round(data.usage.usagePercent));

  if (percent / 100 < warnAt) {
    return null;
  }

  if (percent >= 100) {
    return {
      lead: `You've used ${percent}% of your included conversations.`,
      tail: "to avoid overage charges.",
    };
  }

  return {
    lead: `Your conversation usage is at ${percent}%.`,
    tail: "to avoid overage charges.",
  };
}
