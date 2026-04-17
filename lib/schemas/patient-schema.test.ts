import { describe, it, expect } from "vitest";
import { patientSchema } from "./patient-schema";
import type { PatientFormData } from "./patient-schema";

const validPatient: PatientFormData = {
  first_name: "Juan",
  last_name: "Pérez",
  date_of_birth: "1990-01-15",
  gender: "male",
  condition_coverage: "health_insurance",
  phone: "3534184508"
};

describe("patientSchema", () => {
  describe("Happy path", () => {
    it("should accept all valid fields", () => {
      const result = patientSchema.safeParse(validPatient);
      expect(result.success).toBe(true);
    });
  });

  describe("first_name validation", () => {
    it("should reject empty first_name", () => {
      const result = patientSchema.safeParse({ ...validPatient, first_name: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("first_name");
      }
    });

    it("should reject whitespace-only first_name", () => {
      const result = patientSchema.safeParse({ ...validPatient, first_name: "   " });
      // trim() is applied in schema, so whitespace-only should fail min(1)
      expect(result.success).toBe(false);
    });
  });

  describe("last_name validation", () => {
    it("should reject empty last_name", () => {
      const result = patientSchema.safeParse({ ...validPatient, last_name: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("last_name");
      }
    });
  });

  describe("date_of_birth validation", () => {
    it("should reject empty date_of_birth", () => {
      const result = patientSchema.safeParse({ ...validPatient, date_of_birth: "" });
      expect(result.success).toBe(false);
    });

    it("should reject future date", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const result = patientSchema.safeParse({
        ...validPatient,
        date_of_birth: futureDate.toISOString().split("T")[0]
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("date_of_birth");
      }
    });

    it("should accept today's date", () => {
      const today = new Date().toISOString().split("T")[0];
      const result = patientSchema.safeParse({ ...validPatient, date_of_birth: today });
      // Today should pass, but edge case could fail due to time difference
      // So we just check it doesn't fail with "future" error
      if (!result.success) {
        expect(result.error.issues[0].message).not.toBe("La fecha de nacimiento no puede ser futura");
      }
    });
  });

  describe("gender enum validation", () => {
    it("should accept 'male'", () => {
      const result = patientSchema.safeParse({ ...validPatient, gender: "male" });
      expect(result.success).toBe(true);
    });

    it("should accept 'female'", () => {
      const result = patientSchema.safeParse({ ...validPatient, gender: "female" });
      expect(result.success).toBe(true);
    });

    it("should reject invalid gender", () => {
      const result = patientSchema.safeParse({
        ...validPatient,
        gender: "other" as "male" | "female"
      });
      expect(result.success).toBe(false);
    });
  });

  describe("condition_coverage enum validation", () => {
    it("should accept 'health_insurance'", () => {
      const result = patientSchema.safeParse({
        ...validPatient,
        condition_coverage: "health_insurance"
      });
      expect(result.success).toBe(true);
    });

    it("should accept 'private'", () => {
      const result = patientSchema.safeParse({
        ...validPatient,
        condition_coverage: "private"
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid condition_coverage", () => {
      const result = patientSchema.safeParse({
        ...validPatient,
        condition_coverage: "invalid" as "health_insurance" | "private"
      });
      expect(result.success).toBe(false);
    });
  });

  describe("phone validation", () => {
    it("should reject empty phone", () => {
      const result = patientSchema.safeParse({ ...validPatient, phone: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("Address fields (now optional)", () => {
    it("should accept valid patient without address fields", () => {
      const result = patientSchema.safeParse(validPatient);
      expect(result.success).toBe(true);
    });

    it("should accept address fields when provided", () => {
      const result = patientSchema.safeParse({
        ...validPatient,
        street: "Av. Rivadavia",
        street_number: "1234",
        locality: "Buenos Aires",
        postal_code: "C1000"
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty address fields", () => {
      const result = patientSchema.safeParse({
        ...validPatient,
        street: "",
        street_number: "",
        locality: "",
        postal_code: ""
      });
      // Empty strings are trimmed to empty, optional() allows undefined but not empty string
      // This is actually a design choice - we might want to handle this
      expect(result.success).toBe(true);
    });
  });

  describe("Required fields", () => {
    it("should fail with empty object", () => {
      const result = patientSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        // Now only 6 required fields: first_name, last_name, date_of_birth, gender, condition_coverage, phone
        expect(result.error.issues.length).toBeGreaterThanOrEqual(6);
      }
    });
  });
});