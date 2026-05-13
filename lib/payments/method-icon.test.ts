import { describe, expect, it } from "vitest";

import {
  FALLBACK_PAYMENT_ICON,
  getPaymentMethodIcon,
  normalizePaymentMethod
} from "@/lib/payments/method-icon";

describe("payments method icon resolver", () => {
  it("normalizes method labels by trim and lowercase", () => {
    expect(normalizePaymentMethod("  Transferencia  ")).toBe("transferencia");
    expect(normalizePaymentMethod("TARJETA DE DÉBITO")).toBe("tarjeta de débito");
    expect(normalizePaymentMethod("   ")).toBe("");
  });

  it("returns known icon mappings", () => {
    expect(getPaymentMethodIcon("efectivo")).not.toBe(FALLBACK_PAYMENT_ICON);
    expect(getPaymentMethodIcon(" transferencia ")).not.toBe(FALLBACK_PAYMENT_ICON);
  });

  it("returns fallback icon for unknown methods", () => {
    expect(getPaymentMethodIcon("cripto")).toBe(FALLBACK_PAYMENT_ICON);
    expect(getPaymentMethodIcon("")).toBe(FALLBACK_PAYMENT_ICON);
  });
});
