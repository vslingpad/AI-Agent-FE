"use client";

import { useState } from "react";
import Link from "next/link";
import { useResetKey } from "@/hooks/use-reset-key";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AGENT_NAV,
  agentPath,
  type AgentNavGroup,
} from "@/lib/navigation/agent-sections";
import { cn } from "@/lib/utils";

function isActiveSegment(pathname: string, segment: string) {
  return (
    pathname.endsWith(`/${segment}`) || pathname.includes(`/${segment}/`)
  );
}

function sectionContainsPath(group: AgentNavGroup, pathname: string) {
  return Boolean(
    group.children?.some((item) => isActiveSegment(pathname, item.segment))
  );
}

function defaultOpenSections(): Record<string, boolean> {
  return Object.fromEntries(
    AGENT_NAV.filter((group) => group.children).map((group) => [group.id, true])
  );
}

export function AgentWorkspaceNav({ agentId }: { agentId: string }) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState(defaultOpenSections);

  if (useResetKey(pathname)) {
    const next: Record<string, boolean> = {};

    for (const group of AGENT_NAV) {
      if (group.children && sectionContainsPath(group, pathname)) {
        next[group.id] = true;
      }
    }

    if (Object.keys(next).length > 0) {
      setOpenSections((current) => ({ ...current, ...next }));
    }
  }

  return (
    <nav
      aria-label="Agent sections"
      className="sticky top-14 h-[calc(100svh-var(--notification-banner-height)-3.5rem)] w-52 shrink-0 overflow-y-auto border-r border-border px-2 py-3"
    >
      <ul className="space-y-0.5">
        {AGENT_NAV.map((group) => {
          if (!group.children) {
            const href = agentPath(agentId, group.href);
            const active = isActiveSegment(pathname, group.href ?? "");

            return (
              <li key={group.id}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {group.label}
                </Link>
              </li>
            );
          }

          const open = openSections[group.id] ?? true;

          return (
            <li key={group.id}>
              <Collapsible
                open={open}
                onOpenChange={(next) =>
                  setOpenSections((current) => ({
                    ...current,
                    [group.id]: next,
                  }))
                }
              >
                <CollapsibleTrigger
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted/60 hover:text-foreground",
                    open ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {group.label}
                  <ChevronRightIcon
                    className={cn(
                      "size-3.5 shrink-0 text-muted-foreground transition-transform",
                      open && "rotate-90"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-0.5 space-y-0.5 pb-1">
                    {group.children.map((item) => {
                      const href = agentPath(agentId, item.segment);
                      const active = isActiveSegment(pathname, item.segment);

                      return (
                        <li key={item.id}>
                          <Link
                            href={href}
                            className={cn(
                              "flex items-center rounded-md py-1.5 pr-2 pl-6 text-sm transition-colors",
                              active
                                ? "bg-muted font-medium text-foreground"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            )}
                          >
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
