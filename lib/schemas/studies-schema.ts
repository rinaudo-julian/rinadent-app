import { z } from "zod";

export const STUDY_BUCKET = "pacients-studies-bucket";
export const STUDY_FOLDER_PREFIX = "patient-";
export const MAX_STUDY_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const studyTypeSchema = z.enum([
  "radiography",
  "tomography",
  "photography",
]);

export type StudyType = z.infer<typeof studyTypeSchema>;

export const studyTypeLabels: Record<StudyType, string> = {
  radiography: "Radiografía",
  tomography: "Tomografía",
  photography: "Fotografía",
};

export const ALLOWED_STUDY_FILE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/dicom",
] as const;

const ALLOWED_STUDY_FILE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".dcm"] as const;

function hasAllowedStudyExtension(fileName: string): boolean {
  const normalized = fileName.toLowerCase();
  return ALLOWED_STUDY_FILE_EXTENSIONS.some((extension) => normalized.endsWith(extension));
}

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateOnly(value: string): Date | null {
  if (!dateRegex.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function isFutureDate(value: string): boolean {
  const parsed = parseDateOnly(value);

  if (!parsed) {
    return false;
  }

  const now = new Date();
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  return parsed.getTime() > todayUtc.getTime();
}

export const studyDateSchema = z
  .string()
  .refine((value) => parseDateOnly(value) !== null, {
    message: "La fecha del estudio es inválida",
  })
  .refine((value) => !isFutureDate(value), {
    message: "La fecha del estudio no puede ser futura",
  });

const fileLikeSchema = z.custom<File>(
  (value): value is File => {
    if (!value || typeof value !== "object") {
      return false;
    }

    return (
      "size" in value &&
      "type" in value &&
      "name" in value
    );
  },
  { message: "Debe seleccionar un archivo" }
);

export const studyFileSchema = fileLikeSchema
  .refine(
    (file) => {
      const mimeAllowed = ALLOWED_STUDY_FILE_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_STUDY_FILE_MIME_TYPES)[number]
      );

      return mimeAllowed || hasAllowedStudyExtension(file.name);
    },
    {
    message: "Solo se permiten archivos JPG, PNG, WEBP o DICOM (.dcm)",
    }
  )
  .refine((file) => file.size <= MAX_STUDY_FILE_SIZE_BYTES, {
    message: "El tamaño máximo permitido es 5MB",
  });

export const createStudySchema = z.object({
  type: studyTypeSchema,
  study_date: studyDateSchema,
  file: studyFileSchema,
});

export type CreateStudyInput = z.infer<typeof createStudySchema>;

export interface Study {
  id: string;
  patient_id: string;
  type: StudyType;
  study_date: string;
  file_url: string;
  created_at: string;
  updated_at: string;
  preview_url?: string | null;
}

export const createStudyDefaults: Pick<CreateStudyInput, "type" | "study_date"> = {
  type: "radiography",
  study_date: "",
};
