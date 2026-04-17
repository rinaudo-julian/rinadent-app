import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export interface Treatment {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// GET /api/treatments - List treatments with pagination/search
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const rawPage = searchParams.get("page");
  const parsedPage = Number(rawPage);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const rawLimit = searchParams.get("limit");
  const parsedLimit = Number(rawLimit);
  const validLimits = [10, 50, 100];
  const limit = validLimits.includes(parsedLimit) ? parsedLimit : 10;

  const offset = Math.max(0, (page - 1) * limit);
  const search = searchParams.get("search")?.trim() || "";

  const supabase = await createClient();

  let query = supabase
    .from("treatments")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Error fetching treatments", details: error.message },
      { status: 500 }
    );
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedResponse<Treatment> = {
    data: data as Treatment[],
    total,
    page,
    limit,
    totalPages
  };

  return NextResponse.json(response);
}
