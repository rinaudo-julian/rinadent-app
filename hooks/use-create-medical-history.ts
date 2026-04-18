"use client";

import { useState, useCallback, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  medicalHistoryFormSchema,
  type MedicalHistoryFormData,
} from "@/lib/schemas/medical-history-schema";

interface UseCreateMedicalHistoryParams {
  patientId: string;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: MedicalHistoryFormData = {
  allergies: 0,
  heart_condition: 0,
  diabetes: 0,
  hypertension: 0,
  anticoagulation: 0,
  bisphosphonates: 0,
  osteoporosis: 0,
  hemophilia: 0,
  covid: 0,
  covid_observation: undefined,
  bone_density_studies: 0,
  medications: undefined,
  oncological_treatment: "none",
  previous_lab_results: "none",
  current_lab_results: "none",
};

async function createMedicalHistory(
  patientId: string,
  data: MedicalHistoryFormData
): Promise<MedicalHistoryFormData> {
  const response = await fetch(`/api/patients/${patientId}/medical-history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al crear historial médico");
  }

  return response.json();
}

export function useCreateMedicalHistory({ patientId }: UseCreateMedicalHistoryParams) {
  const [formData, setFormData] = useState<MedicalHistoryFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: MedicalHistoryFormData) => createMedicalHistory(patientId, data),
    onSuccess: () => {
      // Invalidate medical history query to refetch
      queryClient.invalidateQueries({ queryKey: ["medical-history", patientId] });
    },
  });

  const setField = useCallback(
    (fieldName: keyof MedicalHistoryFormData, value: string | number | undefined) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
      // Clear error for this field if it exists
      if (errors[fieldName]) {
        const rest = { ...errors };
        delete rest[fieldName];
        setErrors(rest);
      }
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const result = medicalHistoryFormSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (path && !newErrors[path]) {
          newErrors[path] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [formData]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (validate()) {
        mutation.mutate(formData);
      }
    },
    [validate, mutation, formData]
  );

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    mutation.reset();
  }, [mutation]);

  return {
    formData,
    errors,
    states: {
      isPending: mutation.isPending,
      isError: mutation.isError,
      isSuccess: mutation.isSuccess,
      error: mutation.error,
    },
    methods: {
      setField,
      validate,
      handleSubmit,
      reset,
    },
  };
}
