"use client";

import { useState, useCallback, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  patientSchema,
  type PatientFormData
} from "@/lib/schemas/patient-schema";
import type { Patient } from "./use-patients";

async function createPatient(data: PatientFormData): Promise<Patient> {
  const response = await fetch("/api/patients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create patient");
  }

  return response.json();
}

const initialFormData: PatientFormData = {
  first_name: "",
  last_name: "",
  dni: "",
  date_of_birth: "",
  street: "",
  street_number: "",
  locality: "",
  postal_code: "",
  gender: "male",
  condition_coverage: "health_insurance",
  phone: ""
};

type FormErrors = Record<string, string>;

export function useCreatePatient() {
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    }
  });

  const setField = useCallback(
    (fieldName: keyof PatientFormData, value: string) => {
      setFormData((prev: PatientFormData) => ({ ...prev, [fieldName]: value }));
      if (errors[fieldName]) {
        const { [fieldName]: _, ...rest } = errors;
        setErrors(rest);
      }
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const result = patientSchema.safeParse(formData);

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
      error: mutation.error
    },
    methods: {
      setField,
      validate,
      handleSubmit,
      reset
    }
  };
}
