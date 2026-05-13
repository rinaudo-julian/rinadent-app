"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ALLOWED_LIMITS,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  normalizePage,
  normalizePageSize
} from "@/lib/pagination";

interface UsePaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  pageParamName?: string;
  pageSizeParamName?: string;
}

export function usePagination({
  defaultPage = DEFAULT_PAGE,
  defaultPageSize = DEFAULT_LIMIT,
  pageParamName = "page",
  pageSizeParamName = "limit",
}: UsePaginationOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = normalizePage(searchParams.get(pageParamName), defaultPage);
  const pageSize = normalizePageSize(searchParams.get(pageSizeParamName), defaultPageSize);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        params.set(key, value);
      });

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const setPage = useCallback(
    (nextPage: number) => {
      const normalizedPage = normalizePage(String(nextPage), defaultPage);
      updateParams({ [pageParamName]: String(normalizedPage) });
    },
    [defaultPage, pageParamName, updateParams]
  );

  const setPageSize = useCallback(
    (nextPageSize: number) => {
      const normalizedPageSize = ALLOWED_LIMITS.includes(nextPageSize as (typeof ALLOWED_LIMITS)[number])
        ? nextPageSize
        : defaultPageSize;

      updateParams({
        [pageParamName]: String(defaultPage),
        [pageSizeParamName]: String(normalizedPageSize),
      });
    },
    [defaultPage, defaultPageSize, pageParamName, pageSizeParamName, updateParams]
  );

  const nextPage = useCallback(() => setPage(page + 1), [page, setPage]);
  const prevPage = useCallback(() => setPage(Math.max(defaultPage, page - 1)), [defaultPage, page, setPage]);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
  };
}
