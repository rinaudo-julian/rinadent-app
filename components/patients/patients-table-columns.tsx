"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { Patient } from "@/hooks/use-patients";

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

function formatCoverage(coverage: Patient["condition_coverage"]): string {
  return coverage === "health_insurance" ? "Obra Social" : "Particular";
}

function formatCreatedAt(createdAt: string): string {
  return createdAt.split("T")[0] ?? createdAt;
}

export const patientsTableColumns: ColumnDef<Patient>[] = [
  {
    id: "name",
    accessorFn: (patient) => `${patient.first_name} ${patient.last_name}`.trim(),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Paciente" />,
    cell: ({ row }) => {
      const patient = row.original;
      const fullName = `${patient.first_name} ${patient.last_name}`.trim() || "Paciente sin nombre";

      return (
        <Link
          href={`/patients/${patient.id}`}
          title={fullName}
          className="block w-full min-w-0 truncate text-left font-medium text-primary hover:underline"
        >
          {fullName}
        </Link>
      );
    },
    meta: {
      label: "Paciente",
      headerClassName: "w-[20%]",
      cellClassName: "w-[20%]",
    },
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    meta: {
      label: "Teléfono",
      headerClassName: "w-[16%] whitespace-nowrap",
      cellClassName: "w-[16%] whitespace-nowrap",
    },
    enableSorting: false,
  },
  {
    id: "age",
    accessorFn: (patient) => calculateAge(patient.date_of_birth),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Edad" />,
    cell: ({ row }) => <span>{row.getValue("age") as number} años</span>,
    meta: {
      label: "Edad",
      headerClassName: "w-[10%] whitespace-nowrap",
      cellClassName: "w-[10%] whitespace-nowrap",
    },
  },
  {
    id: "coverage",
    accessorFn: (patient) => formatCoverage(patient.condition_coverage),
    header: "Cobertura",
    cell: ({ row }) => {
      const coverage = row.getValue("coverage") as string;
      const coverageClassName =
        coverage === "Obra Social"
          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"
          : "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200";

      return (
        <Badge variant="outline" className={coverageClassName}>
          {coverage}
        </Badge>
      );
    },
    meta: {
      label: "Cobertura",
      headerClassName: "w-[14%] whitespace-nowrap",
      cellClassName: "w-[14%] whitespace-nowrap",
    },
    enableSorting: false,
  },
  {
    accessorKey: "locality",
    header: "Localidad",
    cell: ({ row }) => <span className="block truncate">{row.original.locality || "—"}</span>,
    meta: {
      label: "Localidad",
      headerClassName: "w-[25%]",
      cellClassName: "w-[25%]",
    },
    enableSorting: false,
  },
  {
    id: "created_at",
    accessorFn: (patient) => formatCreatedAt(patient.created_at),
    header: "Creado",
    meta: {
      label: "Creado",
      headerClassName: "w-[15%] whitespace-nowrap",
      cellClassName: "w-[15%] whitespace-nowrap",
    },
    enableSorting: false,
  },
];
