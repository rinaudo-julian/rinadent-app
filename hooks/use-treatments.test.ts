import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { useTreatments } from "./use-treatments";

const mockRefetch = vi.fn();
type UseQueryOptionsArg = Parameters<typeof useQuery>[0];

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn()
}));

describe("useTreatments", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch
    } as never);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        })
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches list data using params and updates query key on param change", async () => {
    const { rerender } = renderHook((params: { page: number; limit: number; search: string }) => useTreatments(params), {
      initialProps: { page: 1, limit: 10, search: "ortho" }
    });

    const firstCall = vi.mocked(useQuery).mock.calls[0]?.[0] as UseQueryOptionsArg | undefined;
    expect(firstCall).toBeDefined();

    if (!firstCall) {
      throw new Error("Expected useQuery first call");
    }

    const firstQueryFn = firstCall.queryFn;
    expect(typeof firstQueryFn).toBe("function");

    if (typeof firstQueryFn !== "function") {
      throw new Error("Expected useQuery queryFn to be callable");
    }

    await firstQueryFn({
      queryKey: firstCall.queryKey as never,
      signal: new AbortController().signal,
      meta: undefined
    } as never);

    expect(global.fetch).toHaveBeenCalledWith("/api/treatments?page=1&limit=10&search=ortho");
    expect(firstCall.queryKey).toEqual(["treatments", { page: 1, limit: 10, search: "ortho" }]);

    rerender({ page: 2, limit: 50, search: "braces" });

    const secondCall = vi.mocked(useQuery).mock.calls[1]?.[0] as UseQueryOptionsArg | undefined;
    expect(secondCall).toBeDefined();

    if (!secondCall) {
      throw new Error("Expected useQuery second call after rerender");
    }

    expect(secondCall.queryKey).toEqual(["treatments", { page: 2, limit: 50, search: "braces" }]);
  });

  it("exposes a list-only contract without create/mutation methods", () => {
    const { result } = renderHook(() => useTreatments({ page: 1, limit: 10, search: "" }));

    expect(result.current.methods.refetch).toBeDefined();
    expect((result.current.methods as Record<string, unknown>).create).toBeUndefined();
    expect((result.current.methods as Record<string, unknown>).mutate).toBeUndefined();
  });
});
