import { DataTablePagination } from "@/components/data-table/data-table-pagination";

interface PatientLedgerPaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function PatientLedgerPagination(props: PatientLedgerPaginationProps) {
  return <DataTablePagination {...props} />;
}
