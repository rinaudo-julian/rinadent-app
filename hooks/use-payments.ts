import { useQuery } from "@tanstack/react-query";

export interface Payment {
  budget_id: string;
  budget_number: string;
  first_name: string;
  last_name: string;
  method: string;
  amount: number;
  created_at: string;
}

export interface PaginatedPaymentsResponse {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsePaymentsParams {
  page?: number;
  limit?: number;
}

async function fetchPayments(params: UsePaymentsParams = {}): Promise<PaginatedPaymentsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = `/api/payments${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch payments");
  }

  return response.json();
}

export function usePayments(params: UsePaymentsParams = {}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => fetchPayments(params)
  });
}
