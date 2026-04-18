"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMedicalHistory } from "@/hooks/use-medical-history";
import { CreateMedicalHistoryDialog } from "./create-medical-history-dialog";
import { useState } from "react";

// Map field names to Spanish labels
const fieldLabels: Record<string, string> = {
  allergies: "Alergias",
  heart_condition: "Condición cardíaca",
  diabetes: "Diabetes",
  hypertension: "Hipertensión",
  anticoagulation: "Anticoagulación",
  bisphosphonates: "Bifosfonatos",
  osteoporosis: "Osteoporosis",
  hemophilia: "Hemofilia",
  covid: "COVID-19",
  covid_observation: "Observación COVID",
  bone_density_studies: "Estudios de densidad ósea",
  medications: "Medicamentos",
  oncological_treatment: "Tratamiento oncológico",
  previous_lab_results: "Resultados de laboratorio previos",
  current_lab_results: "Resultados de laboratorio actuales",
};

// Map enum values to Spanish labels
const enumLabels: Record<string, Record<string, string>> = {
  oncological_treatment: {
    none: "Ninguno",
    completed: "Completado",
    ongoing: "En curso",
  },
  previous_lab_results: {
    none: "Sin datos",
    normal: "Normales",
    altered: "Alterados",
  },
  current_lab_results: {
    none: "Sin datos",
    normal: "Normales",
    altered: "Alterados",
  },
};

function formatBoolean(value: number): string {
  return value === 1 ? "Sí" : "No";
}

function formatEnum(field: string, value: string): string {
  return enumLabels[field]?.[value] || value;
}

interface MedicalHistoryTabProps {
  patientId: string;
}

export function MedicalHistoryTab({ patientId }: MedicalHistoryTabProps) {
  const { data: medicalHistory, isLoading } = useMedicalHistory({ patientId });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Cargando historial médico...</p>
      </div>
    );
  }

  if (!medicalHistory) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <p className="text-muted-foreground">
          No hay historial médico para este paciente
        </p>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          Crear historial médico
        </Button>

        <CreateMedicalHistoryDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          patientId={patientId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Historial Médico</h3>
      </div>

      {/* Boolean fields - Yes/No questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries({
          allergies: medicalHistory.allergies,
          heart_condition: medicalHistory.heart_condition,
          diabetes: medicalHistory.diabetes,
          hypertension: medicalHistory.hypertension,
          anticoagulation: medicalHistory.anticoagulation,
          bisphosphonates: medicalHistory.bisphosphonates,
          osteoporosis: medicalHistory.osteoporosis,
          hemophilia: medicalHistory.hemophilia,
          covid: medicalHistory.covid,
          bone_density_studies: medicalHistory.bone_density_studies,
        }).map(([field, value]) => (
          <div key={field} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
            <span className="text-sm font-medium">{fieldLabels[field]}</span>
            <span className={`text-sm ${value === 1 ? "text-destructive" : "text-muted-foreground"}`}>
              {formatBoolean(value)}
            </span>
          </div>
        ))}
      </div>

      {/* Conditional COVID observation */}
      {medicalHistory.covid === 1 && medicalHistory.covid_observation && (
        <div className="p-3 bg-muted/50 rounded-md">
          <span className="text-sm font-medium">{fieldLabels.covid_observation}: </span>
          <span className="text-sm text-muted-foreground">{medicalHistory.covid_observation}</span>
        </div>
      )}

      {/* Medications */}
      {medicalHistory.medications && (
        <div className="p-3 bg-muted/50 rounded-md">
          <span className="text-sm font-medium">{fieldLabels.medications}: </span>
          <span className="text-sm text-muted-foreground">{medicalHistory.medications}</span>
        </div>
      )}

      {/* Enum fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-muted/50 rounded-md">
          <span className="text-sm font-medium block">{fieldLabels.oncological_treatment}</span>
          <span className="text-sm text-muted-foreground">
            {formatEnum("oncological_treatment", medicalHistory.oncological_treatment)}
          </span>
        </div>
        <div className="p-3 bg-muted/50 rounded-md">
          <span className="text-sm font-medium block">{fieldLabels.previous_lab_results}</span>
          <span className="text-sm text-muted-foreground">
            {formatEnum("previous_lab_results", medicalHistory.previous_lab_results)}
          </span>
        </div>
        <div className="p-3 bg-muted/50 rounded-md">
          <span className="text-sm font-medium block">{fieldLabels.current_lab_results}</span>
          <span className="text-sm text-muted-foreground">
            {formatEnum("current_lab_results", medicalHistory.current_lab_results)}
          </span>
        </div>
      </div>
    </div>
  );
}