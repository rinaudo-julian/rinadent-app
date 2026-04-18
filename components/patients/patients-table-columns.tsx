"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
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

export const patientsTableColumns: ColumnDef<Patient>[] = [
  {
    id: "name",
    accessorFn: (patient) => `${patient.first_name} ${patient.last_name}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Paciente" />,
    cell: ({ row }) => {
      const patient = row.original;

      return (
        <Button variant="link" className="h-auto p-0 font-medium" asChild>
          <Link href={`/patients/${patient.id}`} className="block truncate">
            {row.getValue("name") as string}
          </Link>
        </Button>
      );
    },
    meta: {
      label: "Paciente",
      headerClassName: "w-[40%] min-w-[220px]",
      cellClassName: "w-[40%] min-w-[220px]",
    },
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    meta: {
      label: "Teléfono",
      headerClassName: "w-[20%] min-w-[140px]",
      cellClassName: "w-[20%] min-w-[140px]",
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
      headerClassName: "w-[16%] min-w-[110px]",
      cellClassName: "w-[16%] min-w-[110px]",
    },
  },
  {
    accessorKey: "locality",
    header: "Localidad",
    meta: {
      label: "Localidad",
      headerClassName: "w-[24%] min-w-[160px]",
      cellClassName: "w-[24%] min-w-[160px]",
    },
    enableSorting: false,
  },
];
