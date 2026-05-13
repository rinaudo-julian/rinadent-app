export const DEFAULT_PAGE = 1;
export const ALLOWED_LIMITS = [10, 20, 30, 50] as const;
export const DEFAULT_LIMIT = ALLOWED_LIMITS[0];

export function normalizePage(rawPage: string | null, fallback: number = DEFAULT_PAGE): number {
  const parsed = Number(rawPage);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function normalizePageSize(rawLimit: string | null, fallback: number = DEFAULT_LIMIT): number {
  const parsed = Number(rawLimit);
  return ALLOWED_LIMITS.includes(parsed as (typeof ALLOWED_LIMITS)[number]) ? parsed : fallback;
}

export function clampPage(page: number, totalPages: number): number {
  if (totalPages <= 0) {
    return DEFAULT_PAGE;
  }

  return Math.min(Math.max(page, DEFAULT_PAGE), totalPages);
}

export function isNumericQueryParam(value: string | null): boolean {
  if (value === null) {
    return true;
  }

  return /^-?\d+$/.test(value.trim());
}
