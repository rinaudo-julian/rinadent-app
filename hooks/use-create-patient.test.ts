import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCreatePatient } from "./use-create-patient";

// Mock de TanStack Query
const mockInvalidateQueries = vi.fn();
const mockMutate = vi.fn();
const mockMutateAsync = vi.fn().mockResolvedValue({ id: "123" });
const mockReset = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(() => ({
    mutate: mockMutate,
    mutateAsync: mockMutateAsync,
    reset: mockReset,
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: mockInvalidateQueries
  }))
}));

describe("useCreatePatient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial state", () => {
    it("should have correct initial formData", () => {
      const { result } = renderHook(() => useCreatePatient());

      // Check required fields
      expect(result.current.formData.first_name).toBe("");
      expect(result.current.formData.last_name).toBe("");
      expect(result.current.formData.date_of_birth).toBe("");
      expect(result.current.formData.gender).toBe("male");
      expect(result.current.formData.condition_coverage).toBe("health_insurance");
    });

    it("should have empty initial errors", () => {
      const { result } = renderHook(() => useCreatePatient());
      expect(result.current.errors).toEqual({});
    });
  });

  describe("setField", () => {
    it("should update field value", () => {
      const { result } = renderHook(() => useCreatePatient());

      act(() => {
        result.current.methods.setField("first_name", "Juan");
      });

      expect(result.current.formData.first_name).toBe("Juan");
    });

    it("should clear error when updating field", () => {
      const { result } = renderHook(() => useCreatePatient());

      // Set initial error
      act(() => {
        result.current.methods.setField("first_name", "");
      });

      // Clear error by setting a value
      act(() => {
        result.current.methods.setField("first_name", "Juan");
      });

      expect(result.current.errors.first_name).toBeUndefined();
    });
  });

  describe("validate", () => {
    it("should return true with valid data", () => {
      const { result } = renderHook(() => useCreatePatient());

      act(() => {
        result.current.methods.setField("first_name", "Juan");
        result.current.methods.setField("last_name", "Pérez");
        result.current.methods.setField("date_of_birth", "1990-01-15");
        result.current.methods.setField("street", "Av. Rivadavia");
        result.current.methods.setField("street_number", "1234");
        result.current.methods.setField("locality", "Buenos Aires");
        result.current.methods.setField("postal_code", "C1000");
        result.current.methods.setField("phone", "3534184508");
      });

      const isValid = result.current.methods.validate();
      expect(isValid).toBe(true);
    });

    it("should return false with invalid data", () => {
      const { result } = renderHook(() => useCreatePatient());

      // Don't fill any required fields
      const isValid = result.current.methods.validate();
      expect(isValid).toBe(false);
    });

    it("should populate errors on validation failure", () => {
      const { result } = renderHook(() => useCreatePatient());

      act(() => {
        result.current.methods.validate();
      });

      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
    });
  });

  describe("handleSubmit", () => {
    it("should call mutation with valid data", async () => {
      const { result } = renderHook(() => useCreatePatient());

      // Fill valid data (only required fields now)
      act(() => {
        result.current.methods.setField("first_name", "Juan");
        result.current.methods.setField("last_name", "Pérez");
        result.current.methods.setField("date_of_birth", "1990-01-15");
        result.current.methods.setField("phone", "3534184508");
      });

      // Create a mock event
      const mockEvent = { preventDefault: vi.fn() };

      await act(async () => {
        await result.current.methods.handleSubmit(
          mockEvent as unknown as React.FormEvent
        );
      });

// Check required fields were passed
      expect(mockMutate).toHaveBeenCalled();
      const callData = mockMutate.mock.calls[0][0];
      expect(callData.first_name).toBe("Juan");
      expect(callData.last_name).toBe("Pérez");
      expect(callData.date_of_birth).toBe("1990-01-15");
      expect(callData.phone).toBe("3534184508");
    });
    });

    it("should NOT call mutation with invalid data", async () => {
      const { result } = renderHook(() => useCreatePatient());

      // Don't fill required fields
      const mockEvent = { preventDefault: vi.fn() };

      await act(async () => {
        await result.current.methods.handleSubmit(
          mockEvent as unknown as React.FormEvent
        );
      });

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe("reset", () => {
    it("should reset form to initial state", () => {
      const { result } = renderHook(() => useCreatePatient());

      // Modify form
      act(() => {
        result.current.methods.setField("first_name", "Juan");
      });

      expect(result.current.formData.first_name).toBe("Juan");

      // Reset
      act(() => {
        result.current.methods.reset();
      });

      expect(result.current.formData.first_name).toBe("");
    });

    it("should clear errors", () => {
      const { result } = renderHook(() => useCreatePatient());

      // Trigger validation to set errors
      act(() => {
        result.current.methods.validate();
      });

      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

      // Reset
      act(() => {
        result.current.methods.reset();
      });

      expect(result.current.errors).toEqual({});
    });
  });

  describe("States", () => {
    it("should have correct state structure", () => {
      const { result } = renderHook(() => useCreatePatient());

      expect(result.current.states).toHaveProperty("isPending");
      expect(result.current.states).toHaveProperty("isError");
      expect(result.current.states).toHaveProperty("isSuccess");
      expect(result.current.states).toHaveProperty("error");
    });
  });
