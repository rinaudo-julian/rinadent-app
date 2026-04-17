import { describe, it, expect } from "vitest";
import { medicalHistoryFormSchema } from "./medical-history-schema";

const validMedicalHistory = {
  allergies: 0,
  heart_condition: 0,
  diabetes: 0,
  hypertension: 0,
  anticoagulation: 0,
  bisphosphonates: 0,
  osteoporosis: 0,
  hemophilia: 0,
  covid: 0,
  bone_density_studies: 0,
  oncological_treatment: "none" as const,
  previous_lab_results: "none" as const,
  current_lab_results: "none" as const,
};

describe("medicalHistoryFormSchema", () => {
  it("should accept valid payload", () => {
    const result = medicalHistoryFormSchema.safeParse(validMedicalHistory);
    expect(result.success).toBe(true);
  });

  it("should reject boolean fields outside 0/1", () => {
    const result = medicalHistoryFormSchema.safeParse({
      ...validMedicalHistory,
      allergies: 2,
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid enum values", () => {
    const result = medicalHistoryFormSchema.safeParse({
      ...validMedicalHistory,
      oncological_treatment: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("should require covid_observation when covid=1", () => {
    const result = medicalHistoryFormSchema.safeParse({
      ...validMedicalHistory,
      covid: 1,
      covid_observation: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("covid_observation"))).toBe(true);
    }
  });

  it("should pass when covid=1 with observation", () => {
    const result = medicalHistoryFormSchema.safeParse({
      ...validMedicalHistory,
      covid: 1,
      covid_observation: "Sin secuelas",
    });
    expect(result.success).toBe(true);
  });
});
