"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BulkPriceUpdateInput,
  TreatmentMode,
  TreatmentRow
} from "@/lib/schemas/treatments-schema";

const treatmentsQueryKey = ["treatments"];

interface TreatmentsFormState {
  isDialogOpen: boolean;
  mode: TreatmentMode;
  unitValue: string;
  percentageValue: string;
  validationError: string | null;
}

function getNumericValue(mode: TreatmentMode, form: TreatmentsFormState) {
  const rawValue = mode === "unit" ? form.unitValue : form.percentageValue;
  if (!rawValue.trim()) {
    return null;
  }

  const parsedValue = Number(rawValue);
  if (Number.isNaN(parsedValue)) {
    return null;
  }

  return parsedValue;
}

async function fetchTreatments(): Promise<TreatmentRow[]> {
  const response = await fetch("/api/treatments");

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Error al obtener tratamientos");
  }

  return response.json();
}

async function bulkUpdateTreatmentPrices(payload: BulkPriceUpdateInput) {
  const response = await fetch("/api/treatments/bulk", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Error al actualizar precios");
  }

  return response.json() as Promise<{ updatedCount: number }>;
}

export interface UseTreatmentsSidebarViewLogicResult {
  data: {
    treatments: TreatmentRow[];
    selectedCodes: string[];
    form: TreatmentsFormState;
  };
  states: {
    isLoading: boolean;
    isFetchError: boolean;
    isSubmitting: boolean;
    isUpdateError: boolean;
    isUnitInputDisabled: boolean;
    isPercentageInputDisabled: boolean;
  };
  methods: {
    toggleSelection: (code: string) => void;
    toggleAllSelection: () => void;
    setDialogOpen: (open: boolean) => void;
    setMode: (mode: TreatmentMode) => void;
    setUnitValue: (value: string) => void;
    setPercentageValue: (value: string) => void;
    clearUpdateError: () => void;
    submitBulkUpdate: () => Promise<boolean>;
  };
}

export function useTreatmentsSidebarViewLogic(): UseTreatmentsSidebarViewLogicResult {
  const queryClient = useQueryClient();
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [form, setForm] = useState<TreatmentsFormState>({
    isDialogOpen: false,
    mode: "unit",
    unitValue: "",
    percentageValue: "",
    validationError: null
  });

  const treatmentsQuery = useQuery({
    queryKey: treatmentsQueryKey,
    queryFn: fetchTreatments
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: bulkUpdateTreatmentPrices,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: treatmentsQueryKey });

      setSelectedCodes([]);
      setForm({
        isDialogOpen: false,
        mode: "unit",
        unitValue: "",
        percentageValue: "",
        validationError: null
      });
    }
  });

  const clearValidationError = useCallback(() => {
    setForm((prev) => ({ ...prev, validationError: null }));
  }, []);

  const toggleSelection = useCallback((code: string) => {
    setSelectedCodes((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code]
    );
  }, []);

  const toggleAllSelection = useCallback(() => {
    const treatments = treatmentsQuery.data ?? [];

    setSelectedCodes((current) =>
      current.length === treatments.length ? [] : treatments.map((item) => item.code)
    );
  }, [treatmentsQuery.data]);

  const setDialogOpen = useCallback((open: boolean) => {
    setForm((prev) => ({ ...prev, isDialogOpen: open, validationError: null }));
  }, []);

  const setMode = useCallback((mode: TreatmentMode) => {
    setForm((prev) => ({
      ...prev,
      mode,
      unitValue: mode === "unit" ? prev.unitValue : "",
      percentageValue: mode === "percentage" ? prev.percentageValue : "",
      validationError: null
    }));
  }, []);

  const setUnitValue = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, unitValue: value, validationError: null }));
  }, []);

  const setPercentageValue = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, percentageValue: value, validationError: null }));
  }, []);

  const clearUpdateError = useCallback(() => {
    bulkUpdateMutation.reset();
  }, [bulkUpdateMutation]);

  const submitBulkUpdate = useCallback(async () => {
    if (selectedCodes.length === 0) {
      setForm((prev) => ({
        ...prev,
        validationError: "Debe seleccionar al menos un tratamiento"
      }));
      return false;
    }

    const value = getNumericValue(form.mode, form);

    if (value === null || value < 0) {
      setForm((prev) => ({
        ...prev,
        validationError: "El valor debe ser un número mayor o igual a 0"
      }));
      return false;
    }

    await bulkUpdateMutation.mutateAsync({
      codes: selectedCodes,
      mode: form.mode,
      value
    });

    return true;
  }, [bulkUpdateMutation, form, selectedCodes]);

  return {
    data: {
      treatments: treatmentsQuery.data ?? [],
      selectedCodes,
      form
    },
    states: {
      isLoading: treatmentsQuery.isLoading,
      isFetchError: treatmentsQuery.isError,
      isSubmitting: bulkUpdateMutation.isPending,
      isUpdateError: bulkUpdateMutation.isError,
      isUnitInputDisabled: form.mode !== "unit",
      isPercentageInputDisabled: form.mode !== "percentage"
    },
    methods: {
      toggleSelection,
      toggleAllSelection,
      setDialogOpen,
      setMode,
      setUnitValue,
      setPercentageValue,
      clearUpdateError,
      submitBulkUpdate
    }
  };
}

export { treatmentsQueryKey };
