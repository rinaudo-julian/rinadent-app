"use client";

import { use, useEffect } from "react";
import { usePatient } from "@/hooks/use-patient";
import { PatientDetailView } from "@/components/patients/patient-detail/patient-detail-view";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePrivateBreadcrumbs } from "@/components/private-breadcrumbs-context";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: patient, isLoading, error } = usePatient({ id });
  const { setCurrentPageLabel } = usePrivateBreadcrumbs();

  useEffect(() => {
    if (!patient) {
      return;
    }

    setCurrentPageLabel(`Paciente ${patient.first_name} ${patient.last_name}`);

    return () => {
      setCurrentPageLabel(null);
    };
  }, [patient, setCurrentPageLabel]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando paciente...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">
          {error?.message || "Paciente no encontrado"}
        </p>
        <Link href="/patients">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Volver a pacientes
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/patients"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-4" />
          Volver a pacientes
        </Link>
        <h1 className="text-3xl font-bold">
          {patient.first_name} {patient.last_name}
        </h1>
      </div>

      <PatientDetailView patientId={id} />
    </div>
  );
}
