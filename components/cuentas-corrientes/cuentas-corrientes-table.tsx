"use client";

import { DataTable } from "@/components/data-table/data-table";
import { cuentasCorrientesTableColumns } from "@/components/cuentas-corrientes/cuentas-corrientes-table-columns";
import type { Payment } from "@/hooks/use-payments";

interface CuentasCorrientesTableProps {
  data: Payment[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function CuentasCorrientesTable({
  data,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange = () => undefined,
  onPageSizeChange = () => undefined
}: CuentasCorrientesTableProps) {
  return (
    <DataTable
      columns={cuentasCorrientesTableColumns}
      data={data}
      pagination={{
        page,
        pageSize,
        totalItems,
        totalPages,
        onPageChange,
        onPageSizeChange
      }}
    />
  );
}
