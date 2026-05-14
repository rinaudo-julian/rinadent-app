"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  LedgerMethod,
  UsePatientLedgerResult
} from "@/components/payments/types/patient-ledger.types";
import { usePagination } from "@/hooks/usePagination";
import { clampPage } from "@/lib/pagination";

interface BudgetSummaryResponse {
  budgetId: string | null;
  budgetNumber?: string;
  patientId: string;
  budgetDate: string | null;
  initialTotal: number;
  currentTotal: number;
  coveredTotal: number;
  pendingTotal: number;
  increaseAmount: number;
  increasePct: number;
}

interface BudgetPaymentsResponse {
  data: Array<{
    id: string;
    method: string;
    amount: number;
    created_at: string;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const EMPTY_BUDGET_SUMMARY: BudgetSummaryResponse = {
  budgetId: null,
  budgetNumber: undefined,
  patientId: "",
  budgetDate: null,
  initialTotal: 0,
  currentTotal: 0,
  coveredTotal: 0,
  pendingTotal: 0,
  increaseAmount: 0,
  increasePct: 0
};

async function fetchBudgetSummary(
  budgetId: string
): Promise<BudgetSummaryResponse> {
  const response = await fetch(`/api/budgets/${budgetId}/summary`);

  if (!response.ok) {
    throw new Error("Failed to fetch budget summary");
  }

  return response.json();
}

async function fetchBudgetPayments(
  budgetId: string,
  page: number,
  limit: number
): Promise<BudgetPaymentsResponse> {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  const response = await fetch(
    `/api/budgets/${budgetId}/payments?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch budget payments");
  }

  return response.json();
}

function normalizeLedgerMethod(method: string): LedgerMethod {
  if (method === "Efectivo" || method === "Transferencia" || method === "Tarjeta") {
    return method;
  }

  return "Efectivo";
}

export function useBudgetLedger(budgetId: string): UsePatientLedgerResult {
  const { page, pageSize, setPage, setPageSize } = usePagination();

  const budgetQuery = useQuery({
    queryKey: ["budget-summary", budgetId],
    queryFn: () => fetchBudgetSummary(budgetId),
    enabled: Boolean(budgetId)
  });

  const paymentsQuery = useQuery({
    queryKey: ["budget-payments", budgetId, page, pageSize],
    queryFn: () => fetchBudgetPayments(budgetId, page, pageSize),
    enabled: Boolean(budgetId)
  });

  const budget = budgetQuery.data ?? EMPTY_BUDGET_SUMMARY;
  const payments = paymentsQuery.data;

  const totalItems = payments?.total ?? 0;
  const totalPages = Math.max(1, payments?.totalPages ?? 1);
  const normalizedPage = clampPage(page, totalPages);

  const rows =
    payments?.data.map((item) => ({
      id: item.id,
      method: normalizeLedgerMethod(item.method),
      amount: item.amount,
      date: item.created_at
    })) ?? [];

  const initialBudget = budget.initialTotal;
  const currentBudget = budget.currentTotal;
  const covered = budget.coveredTotal;
  const pending = budget.pendingTotal;
  const coveragePct =
    currentBudget > 0 ? Math.round((covered / currentBudget) * 100) : 0;

  return {
    analytics: {
      budgetNumber: budget.budgetNumber,
      initialBudget,
      currentBudget,
      initialBudgetDate: budget.budgetDate ?? undefined,
      budgetIncreaseAmount: budget.increaseAmount,
      budgetIncreasePct: budget.increasePct,
      covered,
      pending,
      coveragePct
    },
    rows,
    allRows: rows,
    pagination: {
      page: normalizedPage,
      pageSize,
      totalItems,
      totalPages,
      setPage,
      setPageSize
    }
  };
}
