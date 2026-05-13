"use client";

import { Suspense } from "react";

import { CuentasCorrientesTable } from "@/components/cuentas-corrientes/cuentas-corrientes-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCuentasCorrientesLogic } from "@/hooks/useCuentasCorrientesLogic";

function PaymentsTableSection() {
  const { data, methods } = useCuentasCorrientesLogic();

  return (
    <CuentasCorrientesTable
      data={data.rows}
      page={data.page}
      pageSize={data.pageSize}
      totalItems={data.total}
      totalPages={data.totalPages}
      onPageChange={methods.setPage}
      onPageSizeChange={methods.setPageSize}
    />
  );
}

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cuentas Corrientes</h1>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-[360px] w-full" />
          </div>
        }
      >
        <PaymentsTableSection />
      </Suspense>
    </div>
  );
}
