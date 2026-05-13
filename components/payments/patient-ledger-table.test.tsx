import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PatientLedgerTable } from "@/components/payments/patient-ledger-table";

describe("PatientLedgerTable", () => {
  it("renders exact headers without extra columns", () => {
    render(
      <PatientLedgerTable
        rows={[{ id: "1", method: "Efectivo", amount: 1000, date: "2026-05-10" }]}
      />
    );

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(3);
    expect(screen.getByRole("columnheader", { name: "Método" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Monto" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Fecha" })).toBeTruthy();
    expect(screen.queryByRole("columnheader", { name: /acciones/i })).toBeNull();
  });

  it("renders empty state", () => {
    render(<PatientLedgerTable rows={[]} />);
    expect(screen.getByText("Sin movimientos para mostrar.")).toBeTruthy();
  });
});
