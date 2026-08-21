"use client";

import { useState, type ReactElement } from "react";
import {
  ChevronDownIcon,
  HelpCircleIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import { useClerk, useOrganization, useUser } from "@clerk/nextjs";
import { formatOrgRole, getOrgInitials } from "@/lib/org-utils";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SUPPORT_EMAIL = "support@lingpad.com";

function UserAvatar({
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
        alt={name ?? "User"}
        className={cn("size-8 shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-white",
        className
      )}
    >
      {initials}
    </div>
  );
}

function UserMenuItem({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-sidebar-accent",
        destructive
          ? "text-destructive hover:text-destructive"
          : "text-popover-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}

function UserMenuPopover({
  children,
  side = "top",
  align = "start",
}: {
  children: ReactElement;
  side?: "bottom" | "right" | "top" | "left";
  align?: "start" | "center" | "end";
}) {
  const [open, setOpen] = useState(false);
  const clerk = useClerk();

  const close = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={children} />
      <PopoverContent
        side={side}
        align={align}
        className="w-56 gap-1 rounded-xl p-1"
      >
        <UserMenuItem
          icon={UserIcon}
          label="View profile"
          onClick={() => {
            close();
            clerk.openUserProfile();
          }}
        />
        <UserMenuItem
          icon={HelpCircleIcon}
          label="Need help"
          onClick={() => {
            close();
            window.location.href = `mailto:${SUPPORT_EMAIL}`;
          }}
        />
        <Separator className="my-1" />
        <UserMenuItem
          icon={LogOutIcon}
          label="Logout"
          destructive
          onClick={() => {
            close();
            void clerk.signOut({ redirectUrl: "/" });
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export function SidebarUserFooter() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { membership, isLoaded: isOrgLoaded } = useOrganization();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (!isUserLoaded || !isOrgLoaded) {
    return (
      <div
        className={cn(
          "h-10 animate-pulse rounded-md bg-sidebar-accent",
          isCollapsed ? "mx-auto size-8 rounded-full" : "w-full"
        )}
      />
    );
  }

  const displayName =
    user?.fullName ??
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ??
    "User";
  const roleLabel = formatOrgRole(membership?.role);

  if (isCollapsed) {
    return (
      <UserMenuPopover side="right" align="end">
        <button
          type="button"
          aria-label={`User menu (${displayName})`}
          className="mx-auto flex size-8 items-center justify-center rounded-full transition-colors hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent"
        >
          <UserAvatar
            name={displayName}
            imageUrl={user?.imageUrl}
            hasImage={user?.hasImage}
          />
        </button>
      </UserMenuPopover>
    );
  }

  return (
    <UserMenuPopover>
      <button
        type="button"
        aria-label="User menu"
        className="flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent"
      >
        <UserAvatar
          name={displayName}
          imageUrl={user?.imageUrl}
          hasImage={user?.hasImage}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">
            {displayName}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/60">
            {roleLabel}
          </p>
        </div>

        <ChevronDownIcon className="size-4 shrink-0 text-sidebar-foreground/60" />
      </button>
    </UserMenuPopover>
  );
}
