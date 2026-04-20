import { describe, expect, it } from "vitest";
import {
  createStudySchema,
  MAX_STUDY_FILE_SIZE_BYTES,
  parseDateOnly,
} from "./studies-schema";

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

describe("createStudySchema", () => {
  it("accepts a valid payload", () => {
    const result = createStudySchema.safeParse({
      type: "radiography",
      study_date: getTodayDateString(),
      file: new File(["image-binary"], "study.jpg", { type: "image/jpeg" }),
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid study type", () => {
    const result = createStudySchema.safeParse({
      type: "algo-raro",
      study_date: getTodayDateString(),
      file: new File(["image-binary"], "study.jpg", { type: "image/jpeg" }),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a future study date", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = createStudySchema.safeParse({
      type: "tomography",
      study_date: tomorrow.toISOString().split("T")[0],
      file: new File(["image-binary"], "study.png", { type: "image/png" }),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message.includes("no puede ser futura"))
      ).toBe(true);
    }
  });

  it("rejects a non-allowed mime type", () => {
    const result = createStudySchema.safeParse({
      type: "photography",
      study_date: getTodayDateString(),
      file: new File(["pdf-binary"], "study.pdf", { type: "application/pdf" }),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a file larger than 5MB", () => {
    const bigFile = new File([new Uint8Array(MAX_STUDY_FILE_SIZE_BYTES + 1)], "study.webp", {
      type: "image/webp",
    });

    const result = createStudySchema.safeParse({
      type: "photography",
      study_date: getTodayDateString(),
      file: bigFile,
    });

    expect(result.success).toBe(false);
  });
});

describe("parseDateOnly", () => {
  it("returns null for invalid dates", () => {
    expect(parseDateOnly("2026-02-31")).toBeNull();
    expect(parseDateOnly("31-02-2026")).toBeNull();
  });
});
