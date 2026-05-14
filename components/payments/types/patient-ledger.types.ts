export type LedgerMethod = "Efectivo" | "Transferencia" | "Tarjeta";

export interface LedgerMovement {
  id: string;
  method: LedgerMethod;
  amount: number;
  date: string;
}

export interface PatientLedger {
  patientId: string;
  initialBudgetDate?: string;
  initialBudgetAmount: number;
  currentBudgetAmount: number;
  coveredAmount: number;
  movements: LedgerMovement[];
}

export interface UsePatientLedgerResult {
  analytics: {
    budgetNumber?: string;
    initialBudget: number;
    currentBudget: number;
    initialBudgetDate?: string;
    budgetIncreaseAmount: number;
    budgetIncreasePct: number;
    covered: number;
    pending: number;
    coveragePct: number;
  };
  rows: LedgerMovement[];
  allRows: LedgerMovement[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
  };
}
