"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MedicalHistoryTab } from "./medical-history-tab";
import { OdontogramTab } from "./odontogram-tab";
import { EstudiosTab } from "./estudios-tab";

interface PatientDetailViewProps {
  patientId: string;
}

export function PatientDetailView({ patientId }: PatientDetailViewProps) {
  const [activeTab, setActiveTab] = useState("medical-history");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="md:hidden">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar sección" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medical-history">Historial Médico</SelectItem>
            <SelectItem value="odontograma">Odontograma</SelectItem>
            <SelectItem value="estudios">Estudios</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TabsList className="hidden w-full grid-cols-3 md:grid">
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
