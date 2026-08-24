"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BreadcrumbItem } from "@/lib/navigation/build-sections";

export type BuildPageShellConfig = {
  enableSearch?: boolean;
  searchPlaceholder?: string;
};

export type BuildPageMeta = {
  breadcrumbs?: BreadcrumbItem[];
  enableSearch?: boolean;
  searchPlaceholder?: string;
};

type BuildPageContextValue = {
  shellConfig: BuildPageShellConfig;
  meta: BuildPageMeta;
  setMeta: (meta: BuildPageMeta) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const BuildPageContext = createContext<BuildPageContextValue | null>(null);

export function BuildPageProvider({
  children,
  enableSearch = false,
  searchPlaceholder = "Search…",
}: BuildPageShellConfig & { children: ReactNode }) {
  const [meta, setMetaState] = useState<BuildPageMeta>({});
  const [searchQuery, setSearchQuery] = useState("");

  const setMeta = useCallback((next: BuildPageMeta) => {
    setMetaState(next);
  }, []);

  const value = useMemo(
    () => ({
      shellConfig: { enableSearch, searchPlaceholder },
      meta,
      setMeta,
      searchQuery,
      setSearchQuery,
    }),
    [enableSearch, searchPlaceholder, meta, setMeta, searchQuery]
  );

  return (
    <BuildPageContext.Provider value={value}>{children}</BuildPageContext.Provider>
  );
}

export function useBuildPageContext() {
  const context = useContext(BuildPageContext);

  if (!context) {
    throw new Error("useBuildPageContext must be used within BuildPageProvider");
  }

  return context;
}

export function useOptionalBuildPageContext() {
  return useContext(BuildPageContext);
}
