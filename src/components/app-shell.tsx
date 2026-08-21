"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NotificationBanner } from "@/components/notification-banner";

export function AppShell({ children }: { children: ReactNode }) {
  const [showBanner, setShowBanner] = useState(true);
  const bannerHeight = showBanner ? "2.625rem" : "0px";

  return (
    <SidebarProvider
      className="flex min-h-svh flex-col"
      style={
        {
          "--notification-banner-height": bannerHeight,
        } as CSSProperties
      }
    >
      {showBanner ? (
        <NotificationBanner onDismiss={() => setShowBanner(false)} />
      ) : null}
      <div className="flex min-h-0 w-full flex-1">
        <AppSidebar />
        <SidebarInset className="relative">
          <SidebarTrigger className="absolute left-2 top-2 z-10" />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
