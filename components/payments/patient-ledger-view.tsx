import { PatientLedgerAnalytics } from "@/components/payments/patient-ledger-analytics";
import { PatientLedgerPagination } from "@/components/payments/patient-ledger-pagination";
import { PatientLedgerTable } from "@/components/payments/patient-ledger-table";
import type { UsePatientLedgerResult } from "@/components/payments/types/patient-ledger.types";

interface PatientLedgerViewProps {
  analytics: UsePatientLedgerResult["analytics"];
  rows: UsePatientLedgerResult["rows"];
  pagination: UsePatientLedgerResult["pagination"];
}

export function PatientLedgerView({ analytics, rows, pagination }: PatientLedgerViewProps) {
  return (
    <div className="space-y-6">
      <PatientLedgerAnalytics {...analytics} />
      <PatientLedgerTable rows={rows} />
      <PatientLedgerPagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        totalPages={pagination.totalPages}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
