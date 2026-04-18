import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  patientSchema,
  type PatientFormData
} from "@/lib/schemas/patient-schema";

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
  date_of_birth: string;
  street: string;
  street_number: string;
  locality: string;
  postal_code: string;
  gender: "male" | "female";
  condition_coverage: "health_insurance" | "private";
  phone: string;
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

  // Parse and sanitize page
  const rawPage = searchParams.get("page");
  const parsedPage = Number(rawPage);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  // Parse and sanitize limit
  const rawLimit = searchParams.get("limit");
  const parsedLimit = Number(rawLimit);
  const validLimits = [10, 20, 30, 50];
  const limit = validLimits.includes(parsedLimit) ? parsedLimit : 10;

  // Calculate offset - ensure non-negative
  const offset = Math.max(0, (page - 1) * limit);

  const search = searchParams.get("search")?.trim() || "";

  const supabase = await createClient();

  // Build query - order matters: filter -> order -> search -> range
  let query = supabase
    .from("patients")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Add search filter before range
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%`
    );
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Error fetching patients", details: error.message },
      { status: 500 }
    );
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedResponse<Patient> = {
    data: data as Patient[],
    total,
    page,
    limit,
    totalPages
  };

  return NextResponse.json(response);
}

// POST /api/patients - Create a new patient
export async function POST(request: Request) {
  let body: PatientFormData;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body inválido", details: "JSON mal formado" },
      { status: 400 }
    );
  }

  // Validate with Zod schema
  const result = patientSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        details: result.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message
        }))
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .insert(result.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Error al crear paciente", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
