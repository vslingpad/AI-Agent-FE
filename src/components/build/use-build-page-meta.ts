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
    // meta is represented by the serialized breadcrumb key and search flags.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setMeta, breadcrumbsKey, meta.enableSearch, meta.searchPlaceholder]);
}

export function useBuildSearchQuery() {
  const { searchQuery, setSearchQuery } = useBuildPageContext();

  return { searchQuery, setSearchQuery };
}
