import { useQuery } from "@tanstack/react-query";

export interface Treatment {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface UseTreatmentsParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface PaginatedTreatmentsResponse {
  data: Treatment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchTreatments(
  params: UseTreatmentsParams = {}
): Promise<PaginatedTreatmentsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);

  const queryString = searchParams.toString();
  const url = `/api/treatments${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch treatments");
  }

  return response.json();
}

export function useTreatments(params: UseTreatmentsParams = {}) {
  const query = useQuery({
    queryKey: ["treatments", params],
    queryFn: () => fetchTreatments(params)
  });

  return {
    data: {
      items: query.data?.data ?? [],
      total: query.data?.total ?? 0,
      page: query.data?.page ?? params.page ?? 1,
      limit: query.data?.limit ?? params.limit ?? 10,
      totalPages: query.data?.totalPages ?? 0
    },
    states: {
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error
    },
    methods: {
      refetch: query.refetch
    }
  };
}
