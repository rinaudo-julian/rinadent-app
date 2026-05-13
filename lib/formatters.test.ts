import { describe, expect, it } from "vitest";
import { formatCurrencyArs, formatDateEsAr } from "@/lib/formatters";

describe("formatters", () => {
  it("formats ARS currency", () => {
    expect(formatCurrencyArs(123456.5)).toBe("$ 123.456,50");
  });

  it("formats date in es-AR", () => {
    expect(formatDateEsAr("2026-05-10")).toBe("10/05/2026");
  });

  it("returns fallback for invalid values", () => {
    expect(formatCurrencyArs(Number.NaN)).toBe("$ 0,00");
    expect(formatDateEsAr("not-a-date")).toBe("-");
  });
});
