import { z } from "zod";

export const treatmentModeSchema = z.enum(["unit", "percentage"]);

export const treatmentRowSchema = z.object({
  code: z.string().trim().min(1, "El código es obligatorio"),
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  price: z.coerce.number().min(0, "El precio no puede ser negativo")
});

export const treatmentsListSchema = z.array(treatmentRowSchema);

export const bulkPriceUpdateSchema = z.object({
  codes: z
    .array(z.string().trim().min(1, "El código es obligatorio"))
    .min(1, "Debe seleccionar al menos un tratamiento")
    .transform((codes) => Array.from(new Set(codes))),
  mode: treatmentModeSchema,
  value: z
    .number({ invalid_type_error: "El valor debe ser numérico" })
    .min(0, "El valor no puede ser negativo")
});

export type TreatmentMode = z.infer<typeof treatmentModeSchema>;
export type TreatmentRow = z.infer<typeof treatmentRowSchema>;
export type BulkPriceUpdateInput = z.infer<typeof bulkPriceUpdateSchema>;
