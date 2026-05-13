"use client";

import { CuentasCorrientesTable } from "@/components/cuentas-corrientes/cuentas-corrientes-table";
import { useCuentasCorrientesLogic } from "@/hooks/useCuentasCorrientesLogic";

export default function PaymentsPage() {
  const { data, methods } = useCuentasCorrientesLogic();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cuentas Corrientes</h1>

      <CuentasCorrientesTable
        data={data.rows}
        page={data.page}
        pageSize={data.pageSize}
        totalItems={data.total}
        totalPages={data.totalPages}
        onPageChange={methods.setPage}
        onPageSizeChange={methods.setPageSize}
      />
    </div>
  );
}
