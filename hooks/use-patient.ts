"use client";

import { useQuery } from "@tanstack/react-query";
import type { Patient } from "./use-patients";

interface UsePatientParams {
  id: string | null | undefined;
}

async function fetchPatient(id: string): Promise<Patient> {
  const response = await fetch(`/api/patients/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Paciente no encontrado");
    }
    throw new Error("Error al obtener paciente");
  }
  
  return response.json();
}

export function usePatient({ id }: UsePatientParams) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => fetchPatient(id!),
    enabled: !!id, // Only fetch if id exists
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}