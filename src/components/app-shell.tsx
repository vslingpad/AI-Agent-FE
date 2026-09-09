"use client";

import { useCallback, useState, type CSSProperties, type ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { UsageNotificationBanner } from "@/components/notification-banner";
import { QueryProvider } from "@/components/providers/query-provider";

export function AppShell({ children }: { children: ReactNode }) {
  const [bannerHeight, setBannerHeight] = useState("0px");
  const handleBannerVisibility = useCallback((visible: boolean) => {
    setBannerHeight(visible ? "2.625rem" : "0px");
  }, []);

  return (
    <QueryProvider>
      <SidebarProvider
        className="flex h-svh flex-col overflow-hidden"
        style={
          {
            "--notification-banner-height": bannerHeight,
          } as CSSProperties
        }
      >
        <UsageNotificationBanner onVisibilityChange={handleBannerVisibility} />
        <div className="flex min-h-0 w-full flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset className="relative overflow-y-auto">
            <SidebarTrigger className="absolute left-2 top-2 z-20" />
            <div className="flex flex-1 flex-col">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </QueryProvider>
  );
}
