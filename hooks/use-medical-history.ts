"use client";

import { useQuery } from "@tanstack/react-query";
import type { MedicalHistory } from "@/lib/schemas/medical-history-schema";

interface UseMedicalHistoryParams {
  patientId: string | null;
}

async function fetchMedicalHistory(patientId: string): Promise<MedicalHistory | null> {
  const response = await fetch(`/api/patients/${patientId}/medical-history`);
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Error al obtener historial médico");
  }
  
  return response.json();
}

export function useMedicalHistory({ patientId }: UseMedicalHistoryParams) {
  return useQuery({
    queryKey: ["medical-history", patientId],
    queryFn: () => fetchMedicalHistory(patientId!),
    enabled: !!patientId, // Only fetch if patientId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}