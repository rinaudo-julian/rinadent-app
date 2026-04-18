"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMedicalHistory } from "./use-medical-history";

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

  Wrapper.displayName = "UseMedicalHistoryQueryWrapper";
  return Wrapper;
};

describe("useMedicalHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not fetch when patientId is null", () => {
    const { result } = renderHook(() => useMedicalHistory({ patientId: null }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should fetch medical history when patientId is provided", async () => {
    const mockMedicalHistory = {
      id: "12345678-1234-1234-1234-123456789012",
      patient_id: "12345678-1234-1234-1234-123456789012",
      allergies: 0,
      heart_condition: 0,
      diabetes: 0,
      hypertension: 0,
      anticoagulation: 0,
      bisphosphonates: 0,
      osteoporosis: 0,
      hemophilia: 0,
      covid: 0,
      covid_observation: null,
      bone_density_studies: 0,
      medications: null,
      oncological_treatment: "none",
      previous_lab_results: "none",
      current_lab_results: "none",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMedicalHistory),
    });

    const { result } = renderHook(() => useMedicalHistory({ patientId: "12345678-1234-1234-1234-123456789012" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith("/api/patients/12345678-1234-1234-1234-123456789012/medical-history");
    expect(result.current.data).toEqual(mockMedicalHistory);
  });

  it("should return null when no medical history exists", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null),
    });

    const { result } = renderHook(() => useMedicalHistory({ patientId: "12345678-1234-1234-1234-123456789012" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });

  it("should throw error on API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useMedicalHistory({ patientId: "12345678-1234-1234-1234-123456789012" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
