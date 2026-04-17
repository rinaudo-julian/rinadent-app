"use client";

import { usePatients, Patient } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function formatCoverage(coverage: string): string {
  return coverage === "health_insurance" ? "Obra Social" : "Particular";
}

interface PatientsTableProps {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialData?: {
    data: Patient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function PatientsTable({
  initialPage = 1,
  initialLimit = 10,
  initialSearch = "",
  initialData
}: PatientsTableProps) {
  const { data, isLoading, error } = usePatients({
    page: initialPage,
    limit: initialLimit,
    search: initialSearch,
  });

  // Use fetched data or initial data
  const patients = data?.data ?? initialData?.data ?? [];
  const total = data?.total ?? initialData?.total ?? 0;
  const page = data?.page ?? initialPage;
  const limit = data?.limit ?? initialLimit;
  const totalPages = data?.totalPages ?? initialData?.totalPages ?? 0;

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Error al cargar pacientes
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Cobertura</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron pacientes
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.last_name}, {patient.first_name}
                  </TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{formatCoverage(patient.condition_coverage)}</TableCell>
                  <TableCell>{calculateAge(patient.date_of_birth)} años</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/patients/${patient.id}`}>
                          <Eye className="size-4" />
                          <span className="sr-only">Ver</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/patients/${patient.id}/edit`}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="size-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {patients.length} de {total} pacientes
        </div>
      </div>
    </div>
  );
}