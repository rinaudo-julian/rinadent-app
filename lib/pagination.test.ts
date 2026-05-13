import { describe, expect, it } from "vitest";

import {
  ALLOWED_LIMITS,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  clampPage,
  normalizePage,
  normalizePageSize
} from "@/lib/pagination";

describe("lib/pagination", () => {
  it("uses shared defaults and limits", () => {
    expect(DEFAULT_PAGE).toBe(1);
    expect(DEFAULT_LIMIT).toBe(10);
    expect(ALLOWED_LIMITS).toEqual([10, 20, 30, 50]);
  });

  it("normalizes page values safely", () => {
    expect(normalizePage("3")).toBe(3);
    expect(normalizePage("0")).toBe(DEFAULT_PAGE);
    expect(normalizePage("abc")).toBe(DEFAULT_PAGE);
    expect(normalizePage(null)).toBe(DEFAULT_PAGE);
  });

  it("normalizes page size using allowed limits", () => {
    expect(normalizePageSize("20")).toBe(20);
    expect(normalizePageSize("25")).toBe(DEFAULT_LIMIT);
    expect(normalizePageSize("-5")).toBe(DEFAULT_LIMIT);
    expect(normalizePageSize(null)).toBe(DEFAULT_LIMIT);
  });

  it("clamps page within total pages", () => {
    expect(clampPage(1, 0)).toBe(1);
    expect(clampPage(2, 1)).toBe(1);
    expect(clampPage(2, 4)).toBe(2);
  });
});
