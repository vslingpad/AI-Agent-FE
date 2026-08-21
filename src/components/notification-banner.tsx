"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationBannerProps = {
  message?: string;
  onDismiss?: () => void;
};

export function NotificationBanner({
  message = "Your conversation usage is at 82%. Upgrade your plan to avoid overage charges.",
  onDismiss,
}: NotificationBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className="relative flex shrink-0 items-center justify-center border-b border-border bg-muted/50 px-12 py-2.5 text-sm">
      <p className="text-center text-muted-foreground">{message}</p>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="absolute right-4"
      >
        <XIcon />
      </Button>
    </div>
  );
}
