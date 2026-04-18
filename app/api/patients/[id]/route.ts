import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
  gender: "male" | "female" | "other";
  condition_coverage: "health_insurance" | "private";
  phone: string;
  created_at: string;
  updated_at: string;
}

// GET /api/patients/[id] - Get single patient by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json(
      { error: "ID de paciente inválido" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // PGRST116 = no rows returned
      return NextResponse.json(
        { error: "Paciente no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Error al obtener paciente", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data as Patient);
}
