import { z } from "zod";

export const surfaceKeySchema = z.enum([
  "oclusal",
  "vestibular",
  "mesial",
  "distal",
  "lingual"
]);

export const surfaceStateSchema = z.enum([
  "healthy",
  "planned",
  "existing",
  "completed"
]);

export const toothStateSchema = z.enum([
  "none",
  "planned-extraction",
  "completed-extraction",
  "missing"
]);

export const eventActionSchema = z.enum([
  "planned",
  "existing",
  "completed",
  "planned-extraction",
  "completed-extraction",
  "missing",
  "clear-surface",
  "clear-tooth",
  "clear-all"
]);

export const toothSnapshotSchema = z.object({
  tooth: toothStateSchema,
  surfaces: z.object({
    oclusal: surfaceStateSchema,
    vestibular: surfaceStateSchema,
    mesial: surfaceStateSchema,
    distal: surfaceStateSchema,
    lingual: surfaceStateSchema
  })
});

export const odontogramSnapshotSchema = z.object({
  teeth: z.record(
    z
      .string()
      .regex(/^[1-8][1-8]$/, "Tooth keys must follow FDI notation"),
    toothSnapshotSchema
  )
});

export const odontogramEventInputSchema = z
  .object({
    tooth: z.number().int().min(11).max(88),
    surface: surfaceKeySchema.optional(),
    action: eventActionSchema,
    timestamp: z
      .number()
      .int()
      .nonnegative()
      .optional()
  })
  .superRefine((value, ctx) => {
    const surfaceRequiredActions = new Set([
      "planned",
      "existing",
      "completed",
      "clear-surface"
    ]);
    const toothOnlyActions = new Set([
      "planned-extraction",
      "completed-extraction",
      "missing",
      "clear-tooth",
      "clear-all"
    ]);

    if (surfaceRequiredActions.has(value.action) && !value.surface) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "surface is required for this action",
        path: ["surface"]
      });
    }

    if (toothOnlyActions.has(value.action) && value.surface) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "surface is not allowed for this action",
        path: ["surface"]
      });
    }
  });

export const saveOdontogramPayloadSchema = z.object({
  snapshot: odontogramSnapshotSchema,
  events: z.array(odontogramEventInputSchema)
});

export type SurfaceKey = z.infer<typeof surfaceKeySchema>;
export type SurfaceState = z.infer<typeof surfaceStateSchema>;
export type ToothState = z.infer<typeof toothStateSchema>;
export type EventAction = z.infer<typeof eventActionSchema>;
export type OdontogramSnapshot = z.infer<typeof odontogramSnapshotSchema>;
export type OdontogramEventInput = z.infer<typeof odontogramEventInputSchema>;
