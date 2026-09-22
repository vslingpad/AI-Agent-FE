"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { ChevronDownIcon } from "lucide-react";
import { OrganizationList, useOrganization } from "@clerk/nextjs";
import { useBillingOverview } from "@/hooks/use-billing";
import { formatOrgSwitcherPlanLabel } from "@/lib/billing/subscription-status";
import { getOrgInitials } from "@/lib/org-utils";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type OrgSwitcherHeaderProps = {
  collapsed?: boolean;
};

function OrgAvatar({
  name,
  imageUrl,
  hasImage,
  className,
}: {
  name?: string | null;
  imageUrl?: string;
  hasImage?: boolean;
  className?: string;
}) {
  const initials = getOrgInitials(name);

  if (hasImage && imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name ?? "Organization"}
        className={cn("size-8 shrink-0 rounded-md object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-800 text-xs font-semibold text-white",
        className
      )}
    >
      {initials}
    </div>
  );
}

function OrganizationSwitcherPopover({
  children,
  side = "bottom",
  align = "start",
}: {
  children: ReactElement;
  side?: "bottom" | "right" | "top" | "left";
  align?: "start" | "center" | "end";
}) {
  const [open, setOpen] = useState(false);
  const { organization } = useOrganization();
  const orgIdWhenOpenedRef = useRef<string | null | undefined>(undefined);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      orgIdWhenOpenedRef.current = organization?.id;
    }
    setOpen(nextOpen);
  };

  useEffect(() => {
    if (!open || organization?.id === orgIdWhenOpenedRef.current) {
      return;
    }

    setOpen(false);
  }, [open, organization?.id]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger render={children} />
      <PopoverContent
        side={side}
        align={align}
        className="w-78 max-w-82 p-0 rounded-xl"
      >
        <OrganizationList
          hidePersonal
          skipInvitationScreen
          appearance={{
            elements: {
              rootBox: { width: "100%", maxWidth: "100%" },
              card: "shadow-none border-0 bg-transparent",
            },
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function PlanSubtitle({ loading, label }: { loading: boolean; label: string }) {
  if (loading) {
    return (
      <span
        className="mt-0.5 block h-3 w-20 animate-pulse rounded bg-sidebar-accent"
        aria-hidden
      />
    );
  }

  return (
    <p className="truncate text-xs text-sidebar-foreground/60">{label}</p>
  );
}

export function OrgSwitcherHeader({ collapsed = false }: OrgSwitcherHeaderProps) {
  const { organization, isLoaded } = useOrganization();
  const { data: billing, isLoading: billingLoading } = useBillingOverview();

  const planLabel = billing
    ? formatOrgSwitcherPlanLabel(billing.subscription)
    : "Free";

  if (!isLoaded) {
    return (
      <div
        className={cn(
          "h-10 animate-pulse rounded-md bg-sidebar-accent",
          collapsed ? "mx-auto size-8" : "w-full"
        )}
      />
    );
  }

  if (collapsed) {
    return (
      <OrganizationSwitcherPopover side="right" align="start">
        <button
          type="button"
          aria-label={`Switch organization (${organization?.name ?? "Organization"})`}
          className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent"
        >
          <OrgAvatar
            name={organization?.name}
            imageUrl={organization?.imageUrl}
            hasImage={organization?.hasImage}
          />
        </button>
      </OrganizationSwitcherPopover>
    );
  }

  return (
    <OrganizationSwitcherPopover>
      <button
        type="button"
        aria-label="Switch organization"
        className="flex w-full min-w-0 items-center gap-2 rounded-md border border-sidebar-border px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent"
      >
        <OrgAvatar
          name={organization?.name}
          imageUrl={organization?.imageUrl}
          hasImage={organization?.hasImage}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">
            {organization?.name ?? "Organization"}
          </p>
          <PlanSubtitle loading={billingLoading} label={planLabel} />
        </div>

        <ChevronDownIcon className="size-4 shrink-0 text-sidebar-foreground/60" />
      </button>
    </OrganizationSwitcherPopover>
  );
}
