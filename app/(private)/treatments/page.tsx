"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchInput } from "@/components/search-input";
import { TreatmentsTable } from "@/components/treatments/treatments-table";
import { useTreatments } from "@/hooks/use-treatments";

function SearchInputWithSuspense() {
  return (
    <Suspense fallback={<div className="h-10 w-full max-w-sm animate-pulse rounded-md bg-muted" />}>
      <SearchInput basePath="/treatments" placeholder="Buscar tratamiento..." />
    </Suspense>
  );
}

export default function TreatmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = useMemo(() => {
    const parsed = Number(searchParams.get("page"));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [searchParams]);

  const limit = useMemo(() => {
    const parsed = Number(searchParams.get("limit"));
    return [10, 50, 100].includes(parsed) ? parsed : 10;
  }, [searchParams]);

  const search = searchParams.get("search") ?? "";

  const treatments = useTreatments({ page, limit, search });

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > Math.max(treatments.data.totalPages, 1)) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    params.set("limit", String(limit));

    if (!search.trim()) {
      params.delete("search");
    }

    router.push(`/treatments?${params.toString()}`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tratamientos</h1>
        </div>

        <div className="flex items-center gap-4">
          <SearchInputWithSuspense />
        </div>
      </div>

      <TreatmentsTable
        data={treatments.data}
        states={treatments.states}
        methods={{ onPageChange: handlePageChange }}
      />
    </div>
  );
}
