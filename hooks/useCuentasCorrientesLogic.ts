"use client";

import { usePagination } from "@/hooks/usePagination";
import { usePayments } from "@/hooks/use-payments";

export function useCuentasCorrientesLogic() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const query = usePayments({ page, limit: pageSize });

  return {
    data: {
      rows: query.data?.data ?? [],
      total: query.data?.total ?? 0,
      totalPages: query.data?.totalPages ?? 0,
      page,
      pageSize
    },
    states: {
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error
    },
    methods: {
      setPage,
      setPageSize,
      refetch: query.refetch
    }
  };
}
