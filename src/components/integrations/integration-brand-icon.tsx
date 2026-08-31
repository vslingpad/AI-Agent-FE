"use client";

import {
  BookOpenIcon,
  FileIcon,
  GlobeIcon,
  MessageCircleQuestionIcon,
  TicketIcon,
  type LucideIcon,
} from "lucide-react";
import {
  getBrandIconSrc,
  isNativeKnowledgeIconSlug,
  normalizeIconSlug,
} from "@/assets/icons";
import { INTEGRATION_BRAND } from "@/lib/integrations/connector-paths";
import { cn } from "@/lib/utils";

type IconSize = "sm" | "md" | "tile";

const ICON_BORDER = "border border-border";

const SIZE_CLASS: Record<IconSize, { container: string; icon: string }> = {
  sm: { container: cn("size-6 rounded-md", ICON_BORDER), icon: "size-3.5" },
  md: { container: cn("size-10 rounded-lg", ICON_BORDER), icon: "size-5" },
  tile: { container: cn("size-9 rounded-md", ICON_BORDER), icon: "size-4" },
};

const NATIVE_KNOWLEDGE_ICONS: Record<string, LucideIcon> = {
  files: FileIcon,
  website: GlobeIcon,
  qna: MessageCircleQuestionIcon,
  help_centers: BookOpenIcon,
  tickets: TicketIcon,
};

export function IntegrationBrandIcon({
  slug,
  size = "md",
  className,
}: {
  slug: string;
  size?: IconSize;
  className?: string;
}) {
  const normalizedSlug = normalizeIconSlug(slug);
  const sizeClass = SIZE_CLASS[size];
  const brandIconSrc = getBrandIconSrc(normalizedSlug);

  if (isNativeKnowledgeIconSlug(normalizedSlug)) {
    const NativeIcon = NATIVE_KNOWLEDGE_ICONS[normalizedSlug];

    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center text-muted-foreground",
          sizeClass.container,
          className
        )}
      >
        <NativeIcon className={sizeClass.icon} />
      </div>
    );
  }

  if (brandIconSrc) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center bg-background",
          sizeClass.container,
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brandIconSrc}
          alt=""
          aria-hidden="true"
          className={cn(sizeClass.icon, "object-contain")}
        />
      </div>
    );
  }

  const brand = INTEGRATION_BRAND[normalizedSlug] ?? {
    abbr: normalizedSlug.slice(0, 2).toUpperCase(),
    className: "bg-muted text-muted-foreground",
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-bold tracking-tight",
        size === "sm" ? "text-[9px]" : "text-xs",
        sizeClass.container,
        brand.className,
        className
      )}
    >
      {brand.abbr}
    </div>
  );
}
