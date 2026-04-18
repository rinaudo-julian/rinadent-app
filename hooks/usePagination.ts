"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface UsePaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  pageParamName?: string;
  pageSizeParamName?: string;
}

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function usePagination({
  defaultPage = 1,
  defaultPageSize = 10,
  pageParamName = "page",
  pageSizeParamName = "limit",
}: UsePaginationOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = toPositiveInt(searchParams.get(pageParamName), defaultPage);
  const pageSize = toPositiveInt(searchParams.get(pageSizeParamName), defaultPageSize);

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
      const normalizedPage = Number.isFinite(nextPage) && nextPage > 0 ? nextPage : defaultPage;
      updateParams({ [pageParamName]: String(normalizedPage) });
    },
    [defaultPage, pageParamName, updateParams]
  );

  const setPageSize = useCallback(
    (nextPageSize: number) => {
      const normalizedPageSize =
        Number.isFinite(nextPageSize) && nextPageSize > 0 ? nextPageSize : defaultPageSize;

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
