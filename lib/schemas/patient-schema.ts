import { z } from "zod";

export const patientSchema = z.object({
  first_name: z.string().trim().min(1, "El nombre es requerido"),
  last_name: z.string().trim().min(1, "El apellido es requerido"),
  date_of_birth: z
    .string()
    .min(1, "La fecha de nacimiento es requerida")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return selectedDate <= today;
    }, "La fecha de nacimiento no puede ser futura"),
  street: z.string().trim().optional(),
  street_number: z.string().trim().optional(),
  locality: z.string().trim().optional(),
  postal_code: z.string().trim().optional(),
  gender: z.enum(["male", "female"]),
  condition_coverage: z.enum(["health_insurance", "private"]),
  phone: z.string().trim().min(1, "El teléfono es requerido"),
});

export type PatientFormData = z.infer<typeof patientSchema>;