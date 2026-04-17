import { z } from "zod";

// Schema for form data - patient_id is NOT included (comes from URL params)
export const medicalHistoryFormSchema = z.object({
  // Boolean fields (0 = No, 1 = Yes)
  allergies: z.number().int().min(0).max(1),
  heart_condition: z.number().int().min(0).max(1),
  diabetes: z.number().int().min(0).max(1),
  hypertension: z.number().int().min(0).max(1),
  anticoagulation: z.number().int().min(0).max(1),
  bisphosphonates: z.number().int().min(0).max(1),
  osteoporosis: z.number().int().min(0).max(1),
  hemophilia: z.number().int().min(0).max(1),
  covid: z.number().int().min(0).max(1),
  bone_density_studies: z.number().int().min(0).max(1),

  // Conditional field - required when covid = 1
  covid_observation: z.string().trim().optional(),

  // Text fields
  medications: z.string().trim().optional(),

  // Enum fields
  oncological_treatment: z.enum(["completed", "ongoing", "none"]),
  previous_lab_results: z.enum(["none", "normal", "altered"]),
  current_lab_results: z.enum(["none", "normal", "altered"]),
}).superRefine((data, ctx) => {
  if (data.covid === 1 && !data.covid_observation?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["covid_observation"],
      message: "La observación de COVID es requerida cuando COVID = Sí",
    });
  }
});

// TypeScript type inferred from schema (form data only, no patient_id)
export type MedicalHistoryFormData = z.infer<typeof medicalHistoryFormSchema>;

// For display/response - includes DB-generated fields
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

// Form defaults for creating a new medical history
export const medicalHistoryDefaults: MedicalHistoryFormData = {
  allergies: 0,
  heart_condition: 0,
  diabetes: 0,
  hypertension: 0,
  anticoagulation: 0,
  bisphosphonates: 0,
  osteoporosis: 0,
  hemophilia: 0,
  covid: 0,
  covid_observation: undefined,
  bone_density_studies: 0,
  medications: undefined,
  oncological_treatment: "none",
  previous_lab_results: "none",
  current_lab_results: "none",
};
