"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicalHistoryTab } from "./medical-history-tab";
import { OdontogramTab } from "./odontogram-tab";
import { EstudiosTab } from "./estudios-tab";

interface PatientDetailViewProps {
  patientId: string;
}

export function PatientDetailView({ patientId }: PatientDetailViewProps) {
  return (
    <Tabs defaultValue="medical-history" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="medical-history">Historial Médico</TabsTrigger>
        <TabsTrigger value="odontograma">Odontograma</TabsTrigger>
        <TabsTrigger value="estudios">Estudios</TabsTrigger>
      </TabsList>

      <TabsContent value="medical-history">
        <MedicalHistoryTab patientId={patientId} />
      </TabsContent>

      <TabsContent value="odontograma">
        <OdontogramTab patientId={patientId} />
      </TabsContent>

      <TabsContent value="estudios">
        <EstudiosTab patientId={patientId} />
      </TabsContent>
    </Tabs>
  );
}
