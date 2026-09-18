"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useOrganization } from "@clerk/nextjs";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useBillingOverview,
  useBillingPortalSession,
} from "@/hooks/use-billing";
import {
  getBillingNotificationAlert,
  subscriptionAlertDismissible,
} from "@/lib/billing/billing-alerts";

type NotificationBannerProps = {
  message: ReactNode;
  onDismiss?: () => void;
  dismissible?: boolean;
};

export function NotificationBanner({
  message,
  onDismiss,
  dismissible = true,
}: NotificationBannerProps) {
  return (
    <div className="relative z-20 flex shrink-0 items-center justify-center border-b border-border bg-muted/50 px-12 py-2.5 text-sm">
      <p className="text-center text-muted-foreground">{message}</p>
      {dismissible && onDismiss ? (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="absolute right-4"
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}

export function UsageNotificationBanner({
  onVisibilityChange,
}: {
  onVisibilityChange: (visible: boolean) => void;
}) {
  return (
    <OrgUsageNotificationBanner onVisibilityChange={onVisibilityChange} />
  );
}

function OrgUsageNotificationBanner({
  onVisibilityChange,
}: {
  onVisibilityChange: (visible: boolean) => void;
}) {
  const { membership } = useOrganization();
  const isAdmin = membership?.role === "org:admin";
  const { data } = useBillingOverview();
  const portalSession = useBillingPortalSession();
  const [dismissed, setDismissed] = useState(false);

  const alert = getBillingNotificationAlert(data, isAdmin);
  const canDismiss = subscriptionAlertDismissible(data, isAdmin);
  const visible = Boolean(alert) && !(dismissed && canDismiss);

  useEffect(() => {
    onVisibilityChange(visible);
  }, [onVisibilityChange, visible]);

  const handleManageBilling = async () => {
    try {
      const session = await portalSession.mutateAsync();
      window.open(session.url, "_blank", "noopener,noreferrer");
    } catch {
      // Mutation toast is shown globally.
    }
  };

  if (!visible || !alert) {
    return null;
  }

  if (alert.kind === "subscription") {
    return (
      <NotificationBanner
        dismissible={false}
        message={
          isAdmin ? (
            <>
              {alert.message}{" "}
              <button
                type="button"
                disabled={portalSession.isPending}
                onClick={() => void handleManageBilling()}
                className="font-medium text-foreground underline-offset-4 hover:underline disabled:opacity-50"
              >
                Manage billing
              </button>
            </>
          ) : (
            alert.message
          )
        }
      />
    );
  }

  if ("message" in alert) {
    return (
      <NotificationBanner
        message={alert.message}
        onDismiss={() => {
          setDismissed(true);
          onVisibilityChange(false);
        }}
      />
    );
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
