"use client";

import { TreatmentsSidebarView } from "@/components/treatments/treatments-sidebar-view";
import { useTreatmentsSidebarViewLogic } from "@/hooks/useTreatmentsSidebarViewLogic";

export default function TreatmentsPage() {
  const logic = useTreatmentsSidebarViewLogic();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Prácticas Odontológicas</h1>
      <TreatmentsSidebarView logic={logic} />
    </div>
  );
}
