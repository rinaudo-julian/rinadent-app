import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PatientLedgerAnalytics } from "@/components/payments/patient-ledger-analytics";

describe("PatientLedgerAnalytics", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders consolidated budget card with current/initial values and variation", () => {
    render(
      <PatientLedgerAnalytics
        initialBudget={10000}
        currentBudget={12500}
        initialBudgetDate="2026-03-15"
        budgetIncreaseAmount={2500}
        budgetIncreasePct={25}
        covered={2500}
        pending={10000}
        coveragePct={20}
      />
    );

    expect(screen.getByText("Presupuesto actual")).toBeTruthy();
    expect(screen.getByText("+25%")).toBeTruthy();
    expect(screen.getByText(/Inicial:/)).toBeTruthy();
    expect(screen.getByText(/Inicio: 15\/03\/2026/)).toBeTruthy();
    expect(screen.getByText("Entregas Realizadas")).toBeTruthy();
    expect(screen.getByText("Saldo Pendiente")).toBeTruthy();
    expect(screen.getByText("20% del total cubierto")).toBeTruthy();
  });

  it("shows summary values and valid 0% progress", () => {
    render(
      <PatientLedgerAnalytics
        initialBudget={10000}
        currentBudget={10000}
        initialBudgetDate={undefined}
        budgetIncreaseAmount={0}
        budgetIncreasePct={0}
        covered={0}
        pending={10000}
        coveragePct={0}
      />
    );

    expect(screen.getByText("0% del total cubierto")).toBeTruthy();
    expect(screen.getAllByLabelText("Cobertura").length).toBeGreaterThan(0);
  });
});
