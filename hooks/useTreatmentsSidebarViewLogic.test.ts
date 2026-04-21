import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTreatmentsSidebarViewLogic } from "./useTreatmentsSidebarViewLogic";

function getRequestUrl(input: RequestInfo | URL) {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useTreatmentsSidebarViewLogic", () => {
  it("enforces mode exclusivity between unit and percentage inputs", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 })
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    });

    const { result } = renderHook(() => useTreatmentsSidebarViewLogic(), {
      wrapper: createWrapper(queryClient)
    });

    await waitFor(() => expect(result.current.states.isLoading).toBe(false));

    act(() => {
      result.current.methods.setUnitValue("100");
      result.current.methods.setMode("percentage");
    });

    expect(result.current.states.isUnitInputDisabled).toBe(true);
    expect(result.current.states.isPercentageInputDisabled).toBe(false);
    expect(result.current.data.form.unitValue).toBe("");
  });

  it("rejects negative values without sending an update request", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = getRequestUrl(input);

      if (url.endsWith("/api/treatments")) {
        return new Response(
          JSON.stringify([{ code: "001", name: "Limpieza", price: 1000 }]),
          { status: 200 }
        );
      }

      return new Response(JSON.stringify({ updatedCount: 1 }), { status: 200 });
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    });

    const { result } = renderHook(() => useTreatmentsSidebarViewLogic(), {
      wrapper: createWrapper(queryClient)
    });

    await waitFor(() => expect(result.current.data.treatments.length).toBe(1));

    act(() => {
      result.current.methods.toggleSelection("001");
      result.current.methods.setUnitValue("-5");
    });

    let submitResult = true;
    await act(async () => {
      submitResult = await result.current.methods.submitBulkUpdate();
    });

    expect(submitResult).toBe(false);
    expect(result.current.data.form.validationError).toContain("mayor o igual a 0");
    expect(
      fetchMock.mock.calls.some((call) => {
        const url = getRequestUrl(call[0]);
        return url.endsWith("/api/treatments/bulk");
      })
    ).toBe(false);
  });

  it("submits codes, mode and numeric value and invalidates treatments query", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
      const url = getRequestUrl(input);

      if (url.endsWith("/api/treatments/bulk")) {
        return new Response(JSON.stringify({ updatedCount: 1 }), { status: 200 });
      }

      return new Response(
        JSON.stringify([{ code: "001", name: "Limpieza", price: 1000 }]),
        { status: 200 }
      );
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useTreatmentsSidebarViewLogic(), {
      wrapper: createWrapper(queryClient)
    });

    await waitFor(() => expect(result.current.data.treatments.length).toBe(1));

    act(() => {
      result.current.methods.toggleSelection("001");
      result.current.methods.setMode("percentage");
      result.current.methods.setPercentageValue("3");
    });

    await act(async () => {
      await result.current.methods.submitBulkUpdate();
    });

    const putCall = fetchMock.mock.calls.find((call) => {
      const url = getRequestUrl(call[0]);
      return url.endsWith("/api/treatments/bulk");
    });

    const requestBody = JSON.parse(String(putCall?.[1]?.body ?? "{}"));
    const requestMethod = String(putCall?.[1]?.method ?? "");

    expect(requestMethod).toBe("PUT");
    expect(requestBody).toEqual({ codes: ["001"], mode: "percentage", value: 3 });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["treatments"] });
  });
});
