"use client";

import { use, useEffect } from "react";

import { usePrivateBreadcrumbs } from "@/components/private-breadcrumbs-context";
import { PatientLedgerView } from "@/components/payments/patient-ledger-view";
import { useBudgetLedger } from "@/hooks/use-budget-ledger";

export default function BudgetPaymentsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: budgetId } = use(params);
  const ledger = useBudgetLedger(budgetId);
  const { setCurrentPageLabel } = usePrivateBreadcrumbs();

  useEffect(() => {
    const label = ledger.analytics.budgetNumber ?? null;
    setCurrentPageLabel(label);

    return () => setCurrentPageLabel(null);
  }, [ledger.analytics.budgetNumber, setCurrentPageLabel]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pagos del presupuesto</h1>
      <PatientLedgerView
        analytics={ledger.analytics}
        rows={ledger.rows}
        pagination={ledger.pagination}
      />
    </div>
  );
}
