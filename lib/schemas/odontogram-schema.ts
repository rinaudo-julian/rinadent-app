import { z } from "zod";

export const surfaceKeySchema = z.enum([
  "oclusal",
  "vestibular",
  "mesial",
  "distal",
  "palatino"
]);

export const treatmentStatusSchema = z.enum(["pending", "completed"]);
export const toothStatusSchema = z.enum(["to_extract", "missing"]);
export const surfaceStatusSchema = z.enum([
  "cavity",
  "pre_existing_restoration"
]);

export const eventActionSchema = z.enum([
  "surface-cavity-pending",
  "surface-pre-existing",
  "surface-cavity-completed",
  "tooth-extract-pending",
  "tooth-extract-completed",
  "missing",
  "clear-surface",
  "clear-tooth",
  "clear-all"
]);

export const toothSurfaceSnapshotSchema = z.object({
  status: surfaceStatusSchema,
  treatment_status: treatmentStatusSchema.optional()
}).superRefine((value, ctx) => {
  if (value.status === "pre_existing_restoration" && value.treatment_status !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "treatment_status is not allowed for pre_existing_restoration",
      path: ["treatment_status"]
    });
  }

  if (value.status === "cavity" && value.treatment_status === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "treatment_status is required for cavity",
      path: ["treatment_status"]
    });
  }
});

export const toothSnapshotSchema = z
  .object({
    status: toothStatusSchema.optional(),
    treatment_status: treatmentStatusSchema.optional(),
    surfaces: z
      .record(surfaceKeySchema, toothSurfaceSnapshotSchema)
      .optional()
  })
  .superRefine((value, ctx) => {
    if (value.status === "missing") {
      if (value.treatment_status !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "treatment_status is not allowed when status is missing",
          path: ["treatment_status"]
        });
      }
      if (value.surfaces !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "surfaces is not allowed when status is missing",
          path: ["surfaces"]
        });
      }
    }

    if (value.status === "to_extract") {
      if (value.treatment_status === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "treatment_status is required when status is to_extract",
          path: ["treatment_status"]
        });
      }
      if (value.surfaces !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "surfaces is not allowed when status is to_extract",
          path: ["surfaces"]
        });
      }
    }

    if (value.status === undefined && value.treatment_status !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "treatment_status is only allowed when status exists",
        path: ["treatment_status"]
      });
    }
  });

export const odontogramSnapshotSchema = z.record(
  z.string().regex(/^[1-8][1-8]$/, "Tooth keys must follow FDI notation"),
  toothSnapshotSchema
);

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
      "surface-cavity-pending",
      "surface-pre-existing",
      "surface-cavity-completed",
      "clear-surface"
    ]);
    const toothOnlyActions = new Set([
      "tooth-extract-pending",
      "tooth-extract-completed",
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
export type TreatmentStatus = z.infer<typeof treatmentStatusSchema>;
export type SurfaceStatus = z.infer<typeof surfaceStatusSchema>;
export type ToothStatus = z.infer<typeof toothStatusSchema>;
export type EventAction = z.infer<typeof eventActionSchema>;
export type OdontogramSnapshot = z.infer<typeof odontogramSnapshotSchema>;
export type OdontogramEventInput = z.infer<typeof odontogramEventInputSchema>;
