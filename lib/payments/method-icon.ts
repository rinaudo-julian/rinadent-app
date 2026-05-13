import type { LucideIcon } from "lucide-react";
import { Banknote, CreditCard, Landmark, Wallet, CircleHelp } from "lucide-react";

export const FALLBACK_PAYMENT_ICON = CircleHelp;

const PAYMENT_METHOD_ICONS: Record<string, LucideIcon> = {
  efectivo: Banknote,
  transferencia: Landmark,
  "tarjeta de crédito": CreditCard,
  "tarjeta de debito": CreditCard,
  "tarjeta de débito": CreditCard,
  billetera: Wallet
};

const FALLBACK_ICON_KEY = "fallback";

export function normalizePaymentMethod(method: string): string {
  return method.trim().toLowerCase();
}

export function getPaymentMethodIcon(method: string): LucideIcon {
  const normalized = normalizePaymentMethod(method);
  return PAYMENT_METHOD_ICONS[normalized] ?? FALLBACK_PAYMENT_ICON;
}

export function getPaymentMethodIconKey(method: string): string {
  const normalized = normalizePaymentMethod(method);
  return PAYMENT_METHOD_ICONS[normalized] ? normalized : FALLBACK_ICON_KEY;
}
