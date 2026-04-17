import { useQuery } from "@tanstack/react-query";

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  street: string;
  street_number: string;
  locality: string;
  postal_code: string;
  gender: "male" | "female" | "other";
  condition_coverage: "health_insurance" | "private";
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedPatientsResponse {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsePatientsParams {
  page?: number;
  limit?: number;
  search?: string;
}

async function fetchPatients(params: UsePatientsParams = {}): Promise<PaginatedPatientsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);

  const queryString = searchParams.toString();
  const url = `/api/patients${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error("Failed to fetch patients");
  }

  return response.json();
}

export function usePatients(params: UsePatientsParams = {}) {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: () => fetchPatients(params),
  });
}