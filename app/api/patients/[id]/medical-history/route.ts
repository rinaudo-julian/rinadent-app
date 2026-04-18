import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  medicalHistoryFormSchema,
  type MedicalHistoryFormData,
} from "@/lib/schemas/medical-history-schema";

export interface MedicalHistory {
  id: string;
  patient_id: string;
  allergies: number;
  heart_condition: number;
  diabetes: number;
  hypertension: number;
  anticoagulation: number;
  bisphosphonates: number;
  osteoporosis: number;
  hemophilia: number;
  covid: number;
  covid_observation: string | null;
  bone_density_studies: number;
  medications: string | null;
  oncological_treatment: "completed" | "ongoing" | "none";
  previous_lab_results: "none" | "normal" | "altered";
  current_lab_results: "none" | "normal" | "altered";
  created_at: string;
  updated_at: string;
}

// GET /api/patients/[id]/medical-history - Get medical history for patient
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;

  // Validate patient ID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(patientId)) {
    return NextResponse.json(
      { error: "ID de paciente inválido" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("medical_history")
    .select("*")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Error al obtener historial médico", details: error.message },
      { status: 500 }
    );
  }

  // Return null if no medical history exists yet
  return NextResponse.json(data);
}

// POST /api/patients/[id]/medical-history - Create medical history for patient
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;

  // Validate patient ID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(patientId)) {
    return NextResponse.json(
      { error: "ID de paciente inválido" },
      { status: 400 }
    );
  }

  // Verify patient exists
  const supabase = await createClient();
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single();

  if (patientError || !patient) {
    return NextResponse.json(
      { error: "Paciente no encontrado" },
      { status: 404 }
    );
  }

  // Check if medical history already exists
  const { data: existing } = await supabase
    .from("medical_history")
    .select("id")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "El paciente ya tiene historial médico. Solo se permite uno." },
      { status: 400 }
    );
  }

  // Parse and validate request body
  let body: MedicalHistoryFormData;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body inválido", details: "JSON mal formado" },
      { status: 400 }
    );
  }

  // Validate with Zod schema
  const result = medicalHistoryFormSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  // Insert medical history
  const { data, error } = await supabase
    .from("medical_history")
    .insert({
      patient_id: patientId,
      ...result.data,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Error al crear historial médico", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data as MedicalHistory, { status: 201 });
}