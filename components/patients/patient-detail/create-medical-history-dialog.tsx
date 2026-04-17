"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMedicalHistory } from "@/hooks/use-create-medical-history";
import type { MedicalHistoryFormData } from "@/lib/schemas/medical-history-schema";

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

interface CreateMedicalHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
}

// Boolean fields that need Yes/No selection
const booleanFields = [
  "allergies",
  "heart_condition",
  "diabetes",
  "hypertension",
  "anticoagulation",
  "bisphosphonates",
  "osteoporosis",
  "hemophilia",
  "covid",
  "bone_density_studies",
] as const;

type MedicalHistoryBooleanField = (typeof booleanFields)[number];

export function CreateMedicalHistoryDialog({
  open,
  onOpenChange,
  patientId,
}: CreateMedicalHistoryDialogProps) {
  const { formData, errors, states, methods } = useCreateMedicalHistory({
    patientId,
  });

  // Handle successful creation
  useEffect(() => {
    if (states.isSuccess) {
      methods.reset();
      onOpenChange(false);
    }
  }, [states.isSuccess, methods.reset, onOpenChange]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      methods.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Historial Médico</DialogTitle>
          <DialogDescription>
            Complete la información del historial médico del paciente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={methods.handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Boolean fields - Yes/No questions */}
            {booleanFields.map((field) => (
              <div key={field} className="flex items-center justify-between">
                <Label htmlFor={field} className="text-right">
                  {fieldLabels[field]}
                </Label>
                <Select
                  value={formData[field].toString()}
                  onValueChange={(value) =>
                    methods.setField(field as MedicalHistoryBooleanField, Number(value) as 0 | 1)
                  }
                >
                  <SelectTrigger id={field} className="w-[150px]">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No</SelectItem>
                    <SelectItem value="1">Sí</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}

            {/* Conditional COVID observation */}
            {formData.covid === 1 && (
              <div className="space-y-2">
                <Label htmlFor="covid_observation">
                  {fieldLabels.covid_observation}
                </Label>
                <Textarea
                  id="covid_observation"
                  value={formData.covid_observation || ""}
                  onChange={(e) =>
                    methods.setField("covid_observation", e.target.value)
                  }
                  placeholder="Observaciones sobre COVID-19..."
                  className={errors.covid_observation ? "border-destructive" : ""}
                />
                {errors.covid_observation && (
                  <p className="text-sm text-destructive">
                    {errors.covid_observation}
                  </p>
                )}
              </div>
            )}

            {/* Medications */}
            <div className="space-y-2">
              <Label htmlFor="medications">{fieldLabels.medications}</Label>
              <Textarea
                id="medications"
                value={formData.medications || ""}
                onChange={(e) =>
                  methods.setField("medications", e.target.value)
                }
                placeholder="Medicamentos habituales..."
              />
            </div>

            {/* Enum fields */}
            <div className="space-y-2">
              <Label htmlFor="oncological_treatment">
                {fieldLabels.oncological_treatment}
              </Label>
              <Select
                value={formData.oncological_treatment}
                onValueChange={(value) =>
                  methods.setField(
                    "oncological_treatment",
                    value as MedicalHistoryFormData["oncological_treatment"]
                  )
                }
              >
                <SelectTrigger id="oncological_treatment">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="ongoing">En curso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="previous_lab_results">
                {fieldLabels.previous_lab_results}
              </Label>
              <Select
                value={formData.previous_lab_results}
                onValueChange={(value) =>
                  methods.setField(
                    "previous_lab_results",
                    value as MedicalHistoryFormData["previous_lab_results"]
                  )
                }
              >
                <SelectTrigger id="previous_lab_results">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin datos</SelectItem>
                  <SelectItem value="normal">Normales</SelectItem>
                  <SelectItem value="altered">Alterados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_lab_results">
                {fieldLabels.current_lab_results}
              </Label>
              <Select
                value={formData.current_lab_results}
                onValueChange={(value) =>
                  methods.setField(
                    "current_lab_results",
                    value as MedicalHistoryFormData["current_lab_results"]
                  )
                }
              >
                <SelectTrigger id="current_lab_results">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin datos</SelectItem>
                  <SelectItem value="normal">Normales</SelectItem>
                  <SelectItem value="altered">Alterados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error message */}
            {states.isError && (
              <div className="text-sm text-destructive">
                Error al crear historial médico: {states.error?.message}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={states.isPending}>
              {states.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
