import { BuildPageHeader } from "@/components/build/build-page-header";
import {
  BuildPageProvider,
  type BuildPageShellConfig,
} from "@/components/build/build-page-context";
import type { ReactNode } from "react";

export function BuildPageShell({
  children,
  enableSearch = false,
  searchPlaceholder = "Search…",
}: BuildPageShellConfig & { children: ReactNode }) {
  return (
    <BuildPageProvider
      enableSearch={enableSearch}
      searchPlaceholder={searchPlaceholder}
    >
      <div className="flex min-h-full flex-col">
        <BuildPageHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </BuildPageProvider>
  );
}
