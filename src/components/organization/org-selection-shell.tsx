"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/components/providers/query-provider";

export function OrgSelectionShell({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex min-h-svh flex-col bg-background">{children}</div>
    </QueryProvider>
  );
}
