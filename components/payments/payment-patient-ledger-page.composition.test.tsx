import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import PaymentPatientLedgerPage from "@/app/(private)/budgets/[id]/payments/page";
import { useBudgetLedger } from "@/hooks/use-budget-ledger";

vi.mock("@/hooks/use-budget-ledger", () => ({
  useBudgetLedger: vi.fn()
}));

const resolvedParams = {
  status: "fulfilled",
  value: { id: "123" },
  then: () => {}
} as unknown as Promise<{ id: string }>;

describe("PaymentPatientLedgerPage composition", () => {
  it("delegates pagination behavior to hook-provided handlers", () => {
    const setPage = vi.fn();

    vi.mocked(useBudgetLedger).mockReturnValue({
      analytics: {
        initialBudget: 1000,
        currentBudget: 1200,
        initialBudgetDate: "2026-03-15",
        budgetIncreaseAmount: 200,
        budgetIncreasePct: 20,
        covered: 200,
        pending: 1000,
        coveragePct: 17
      },
      allRows: [
        { id: "m1", method: "Efectivo", amount: 100, date: "2026-04-01" },
        { id: "m2", method: "Tarjeta", amount: 200, date: "2026-04-02" }
      ],
      rows: [{ id: "m1", method: "Efectivo", amount: 100, date: "2026-04-01" }],
      pagination: {
        page: 1,
        pageSize: 1,
        totalItems: 2,
        totalPages: 2,
        setPage,
        setPageSize: vi.fn()
      }
    });

    render(<PaymentPatientLedgerPage params={resolvedParams} />);

    fireEvent.click(screen.getByRole("link", { name: "Go to next page" }));

    expect(useBudgetLedger).toHaveBeenCalledWith("123");
    expect(setPage).toHaveBeenCalledWith(2);
  });
});
