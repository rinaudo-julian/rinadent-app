import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { flexRender } from "@tanstack/react-table";

import { cuentasCorrientesTableColumns } from "@/components/cuentas-corrientes/cuentas-corrientes-table-columns";
import type { Payment } from "@/hooks/use-payments";

const rows: Payment[] = [
  {
    budget_id: "budget-1",
    budget_number: "PRES-2026-0001",
    first_name: "Ana",
    last_name: "Pérez",
    method: "Efectivo",
    amount: 10000,
    created_at: "2026-05-10T12:00:00.000Z"
  },
  {
    budget_id: "budget-2",
    budget_number: "PRES-2026-0002",
    first_name: "Juan",
    last_name: "López",
    method: "Cripto",
    amount: 8500,
    created_at: "2026-05-10T13:00:00.000Z"
  }
];

function renderBudgetCell(row: Payment) {
  const column = cuentasCorrientesTableColumns[0];
  render(
    <>
      {flexRender(column.cell, {
        row: {
          original: row
        }
      } as never)}
    </>
  );
}

describe("CuentasCorrientes budget cell", () => {
  it("renders budget number as link to budget payments detail", () => {
    renderBudgetCell(rows[0]);

    const link = screen.getByRole("link", { name: "PRES-2026-0001" });
    expect(link.getAttribute("href")).toBe("/budgets/budget-1/payments");
  });

  it("renders method label with mapped icon", () => {
    const column = cuentasCorrientesTableColumns[2];
    render(
      <>
        {flexRender(column.cell, {
          row: {
            original: rows[0]
          }
        } as never)}
      </>
    );

    expect(screen.getByText("Efectivo")).not.toBeNull();
    expect(screen.getByTestId("payment-method-icon-efectivo")).not.toBeNull();
  });
});
