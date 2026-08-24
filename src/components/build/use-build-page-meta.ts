"use client";

import { useEffect } from "react";
import {
  useBuildPageContext,
  type BuildPageMeta,
} from "@/components/build/build-page-context";

export function useBuildPageMeta(meta: BuildPageMeta) {
  const { setMeta } = useBuildPageContext();
  const breadcrumbsKey = JSON.stringify(meta.breadcrumbs ?? null);

  useEffect(() => {
    setMeta(meta);

    return () => {
      setMeta({});
    };
  }, [setMeta, breadcrumbsKey, meta.enableSearch, meta.searchPlaceholder]);
}

export function useBuildSearchQuery() {
  const { searchQuery, setSearchQuery } = useBuildPageContext();

  return { searchQuery, setSearchQuery };
}
