import { createClient } from "@/lib/supabase/server";
import {
  createStudySchema,
  STUDY_BUCKET,
  STUDY_FOLDER_PREFIX,
  type Study,
} from "@/lib/schemas/studies-schema";
import { NextResponse } from "next/server";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getFileExtensionFromMimeType(mimeType: string): string {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function getStudyPath(patientId: string, mimeType: string) {
  const extension = getFileExtensionFromMimeType(mimeType);
  const folder = `${STUDY_FOLDER_PREFIX}${patientId}-studies`;
  return `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

async function ensurePatientExists(patientId: string) {
  const supabase = await createClient();
  const { data: patient, error } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single();

  if (error || !patient) {
    return false;
  }

  return true;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;

  if (!uuidRegex.test(patientId)) {
    return NextResponse.json(
      { error: "ID de paciente inválido" },
      { status: 400 }
    );
  }

  const patientExists = await ensurePatientExists(patientId);
  if (!patientExists) {
    return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studies")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Error al obtener estudios", details: error.message },
      { status: 500 }
    );
  }

  const studies = (data ?? []) as Study[];

  const studiesWithPreview = await Promise.all(
    studies.map(async (study) => {
      const { data: signedUrlData } = await supabase.storage
        .from(STUDY_BUCKET)
        .createSignedUrl(study.file_url, 60 * 60);

      return {
        ...study,
        preview_url: signedUrlData?.signedUrl ?? null,
      };
    })
  );

  return NextResponse.json(studiesWithPreview);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;

  if (!uuidRegex.test(patientId)) {
    return NextResponse.json(
      { error: "ID de paciente inválido" },
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        details: [{ field: "formData", message: "Multipart mal formado" }],
      },
      { status: 400 }
    );
  }

  const result = createStudySchema.safeParse({
    type: formData.get("type"),
    study_date: formData.get("study_date"),
    file: formData.get("file"),
  });

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

  const patientExists = await ensurePatientExists(patientId);
  if (!patientExists) {
    return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
  }

  const supabase = await createClient();
  const studyPath = getStudyPath(patientId, result.data.file.type);

  const { error: uploadError } = await supabase.storage
    .from(STUDY_BUCKET)
    .upload(studyPath, result.data.file, {
      contentType: result.data.file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Error al subir archivo", details: uploadError.message },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("studies")
    .insert({
      patient_id: patientId,
      type: result.data.type,
      study_date: result.data.study_date,
      file_url: studyPath,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(STUDY_BUCKET).remove([studyPath]);

    return NextResponse.json(
      { error: "Error al crear estudio", details: error.message },
      { status: 500 }
    );
  }

  const study = data as Study;
  const { data: signedUrlData } = await supabase.storage
    .from(STUDY_BUCKET)
    .createSignedUrl(study.file_url, 60 * 60);

  return NextResponse.json(
    {
      ...study,
      preview_url: signedUrlData?.signedUrl ?? null,
    },
    { status: 201 }
  );
}
