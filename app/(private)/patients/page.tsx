"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { patientsTableColumns } from "@/components/patients/patients-table-columns";
import { Plus } from "lucide-react";
import { CreatePatientForm } from "@/components/patients/create-patient-form";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatients } from "@/hooks/use-patients";
import { usePagination } from "@/hooks/usePagination";

function PatientsTableSection() {
  const searchParams = useSearchParams();
  const { page, pageSize, setPage, setPageSize } = usePagination();

  const search = searchParams.get("search") ?? "";

  const { data } = usePatients({
    page,
    limit: pageSize,
    search,
  });

  const patients = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <DataTable
      columns={patientsTableColumns}
      data={patients}
      pagination={{
        page,
        pageSize,
        totalItems: total,
        totalPages,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
    />
  );
}

export default function PatientsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="size-4 mr-2" />
            Nuevo Paciente
          </Button>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-[360px] w-full" />
          </div>
        }
      >
        <PatientsTableSection />
      </Suspense>

      <CreatePatientForm open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
