"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePatient } from "./use-patient";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  Wrapper.displayName = "UsePatientQueryWrapper";
  return Wrapper;
};

describe("usePatient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not fetch when id is null", () => {
    const { result } = renderHook(() => usePatient({ id: null }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should not fetch when id is undefined", () => {
    const { result } = renderHook(() => usePatient({ id: undefined }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should fetch patient when id is provided", async () => {
    const mockPatient = {
      id: "12345678-1234-1234-1234-123456789012",
      first_name: "Juan",
      last_name: "Pérez",
      dni: "30123456",
      date_of_birth: "1990-01-15",
      street: "Av. Rivadavia",
      street_number: "1234",
      locality: "Buenos Aires",
      postal_code: "C1000",
      gender: "male",
      condition_coverage: "health_insurance",
      phone: "3534184508",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPatient),
    });

    const { result } = renderHook(() => usePatient({ id: "12345678-1234-1234-1234-123456789012" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith("/api/patients/12345678-1234-1234-1234-123456789012");
    expect(result.current.data).toEqual(mockPatient);
  });

  it("should throw error on 404", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => usePatient({ id: "12345678-1234-1234-1234-123456789012" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
