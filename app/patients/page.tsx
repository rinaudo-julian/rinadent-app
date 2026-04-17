import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { LimitSelector } from "@/components/limit-selector";
import { PaginationControls } from "@/components/pagination-controls";
import { SearchInput } from "@/components/search-input";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

// Types
interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  condition_coverage: "health_insurance" | "private";
  is_active: boolean;
  created_at: string;
}

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

async function getPatients(
  page: number = 1,
  limit: number = 10,
  search: string = ""
) {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from("patients")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Add search filter if provided
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching patients:", error);
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  return {
    data: (data as Patient[]) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  };
}

function PatientRow({ patient }: { patient: Patient }) {
  return (
    <TableRow>
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
  );
}

export default async function PatientsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "10");
  const search = params.search || "";
  const { data, total, totalPages } = await getPatients(page, limit, search);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <Button asChild>
            <Link href="/patients/new">
              <Plus className="size-4 mr-2" />
              Nuevo Paciente
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <SearchInput />
        </div>
      </div>

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
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron pacientes
                </TableCell>
              </TableRow>
            ) : (
              data.map((patient) => (
                <PatientRow key={patient.id} patient={patient} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <LimitSelector limit={limit} total={total} />
        </div>

        <PaginationControls page={page} limit={limit} totalPages={totalPages} />
      </div>
    </div>
  );
}
