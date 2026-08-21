"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BotIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  PlugIcon,
  SettingsIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { Show } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { BillingUsageCard } from "@/components/billing-usage-card";
import { OrgSwitcherHeader } from "@/components/org-switcher-header";

const buildItems = [
  { title: "Agents", href: "/agents", icon: BotIcon },
  { title: "Integrations", href: "/integrations", icon: PlugIcon },
  { title: "Actions", href: "/actions", icon: ZapIcon },
];

const accountItems = [
  { title: "Billing", href: "/billing", icon: CreditCardIcon },
  { title: "Team", href: "/team", icon: UsersIcon },
  { title: "Settings", href: "/settings", icon: SettingsIcon },
];

function NavItem({
  title,
  href,
  icon: Icon,
}: {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={title}
        render={<Link href={href} />}
      >
        <Icon />
        <span>{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="top-(--notification-banner-height)! h-[calc(100svh-var(--notification-banner-height))]!"
    >
      <SidebarHeader className="p-2">
        <div className="group-data-[collapsible=icon]:hidden">
          <OrgSwitcherHeader />
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex justify-center">
          <OrgSwitcherHeader collapsed />
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/"}
                  tooltip="Dashboard"
                  render={<Link href="/" />}
                >
                  <LayoutDashboardIcon />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Build</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {buildItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Show when={{ role: "org:admin" }}>
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {accountItems.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Show>
      </SidebarContent>

      <SidebarFooter>
        <BillingUsageCard />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
