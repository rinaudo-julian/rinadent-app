import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// GET /api/patients - List patients with pagination
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Pagination params
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;
  
  // Filter params (for future use)
  const isActive = searchParams.get("is_active") !== "false";
  const search = searchParams.get("search") || "";
  
  // Validate limit values
  const validLimits = [10, 50, 100];
  const finalLimit = validLimits.includes(limit) ? limit : 10;
  
  const supabase = await createClient();
  
  // Build query
  let query = supabase
    .from("patients")
    .select("*", { count: "exact" })
    .eq("is_active", isActive)
    .order("created_at", { ascending: false })
    .range(offset, offset + finalLimit - 1);
  
  // Add search filter if provided
  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  }
  
  const { data, error, count } = await query;
  
  if (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Error fetching patients", details: error.message },
      { status: 500 }
    );
  }
  
  const total = count || 0;
  const totalPages = Math.ceil(total / finalLimit);
  
  const response: PaginatedResponse<Patient> = {
    data: data as Patient[],
    total,
    page,
    limit: finalLimit,
    totalPages,
  };
  
  return NextResponse.json(response);
}