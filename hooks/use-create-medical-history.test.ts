import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCreateMedicalHistory } from "./use-create-medical-history";

const mockInvalidateQueries = vi.fn();
const mockMutate = vi.fn();
const mockReset = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(() => ({
    mutate: mockMutate,
    reset: mockReset,
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: mockInvalidateQueries,
  })),
}));

describe("useCreateMedicalHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default form values", () => {
    const { result } = renderHook(() =>
      useCreateMedicalHistory({
        patientId: "12345678-1234-1234-1234-123456789012",
      })
    );

    expect(result.current.formData.allergies).toBe(0);
    expect(result.current.formData.covid).toBe(0);
    expect(result.current.formData.oncological_treatment).toBe("none");
  });

  it("should update fields with setField", () => {
    const { result } = renderHook(() =>
      useCreateMedicalHistory({
        patientId: "12345678-1234-1234-1234-123456789012",
      })
    );

    act(() => {
      result.current.methods.setField("allergies", 1);
      result.current.methods.setField("oncological_treatment", "ongoing");
    });

    expect(result.current.formData.allergies).toBe(1);
    expect(result.current.formData.oncological_treatment).toBe("ongoing");
  });

  it("should fail validation when covid=1 and covid_observation is empty", async () => {
    const { result } = renderHook(() =>
      useCreateMedicalHistory({
        patientId: "12345678-1234-1234-1234-123456789012",
      })
    );

    act(() => {
      result.current.methods.setField("covid", 1);
      result.current.methods.setField("covid_observation", "");
    });

    let isValid = true;
    act(() => {
      isValid = result.current.methods.validate();
    });

    expect(isValid).toBe(false);
    await waitFor(() => {
      expect(result.current.errors.covid_observation).toBeDefined();
    });
  });

  it("should validate successfully with valid data", () => {
    const { result } = renderHook(() =>
      useCreateMedicalHistory({
        patientId: "12345678-1234-1234-1234-123456789012",
      })
    );

    act(() => {
      result.current.methods.setField("covid", 1);
      result.current.methods.setField("covid_observation", "Sin secuelas");
    });

    const isValid = result.current.methods.validate();
    expect(isValid).toBe(true);
  });

  it("should call mutate on submit with valid form", async () => {
    const { result } = renderHook(() =>
      useCreateMedicalHistory({
        patientId: "12345678-1234-1234-1234-123456789012",
      })
    );

    act(() => {
      result.current.methods.setField("covid", 1);
      result.current.methods.setField("covid_observation", "Paciente recuperado");
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      result.current.methods.handleSubmit(mockEvent);
    });

    expect(mockMutate).toHaveBeenCalledTimes(1);
  });
});
