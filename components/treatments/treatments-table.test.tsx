import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TreatmentsTable } from "./treatments-table";

describe("TreatmentsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state", () => {
    render(
      <TreatmentsTable
        data={{ items: [], total: 0, page: 1, limit: 10, totalPages: 0 }}
        states={{ isLoading: true, isError: false, error: null }}
        methods={{ onPageChange: vi.fn() }}
      />
    );

    expect(screen.getByText("Cargando tratamientos...")).toBeDefined();
  });

  it("shows empty state", () => {
    render(
      <TreatmentsTable
        data={{ items: [], total: 0, page: 1, limit: 10, totalPages: 0 }}
        states={{ isLoading: false, isError: false, error: null }}
        methods={{ onPageChange: vi.fn() }}
      />
    );

    expect(screen.getByText("No se encontraron tratamientos")).toBeDefined();
  });

  it("shows error state", () => {
    render(
      <TreatmentsTable
        data={{ items: [], total: 0, page: 1, limit: 10, totalPages: 0 }}
        states={{ isLoading: false, isError: true, error: new Error("boom") }}
        methods={{ onPageChange: vi.fn() }}
      />
    );

    expect(screen.getByText("Error al cargar tratamientos")).toBeDefined();
  });

  it("renders treatments and pagination summary", () => {
    render(
      <TreatmentsTable
        data={{
          items: [
            {
              id: "1",
              code: "TR-001",
              name: "Limpieza",
              created_at: "",
              updated_at: ""
            },
            {
              id: "2",
              code: "TR-002",
              name: "Ortodoncia",
              created_at: "",
              updated_at: ""
            }
          ],
          total: 12,
          page: 1,
          limit: 10,
          totalPages: 2
        }}
        states={{ isLoading: false, isError: false, error: null }}
        methods={{ onPageChange: vi.fn() }}
      />
    );

    expect(screen.getByText("TR-001")).toBeDefined();
    expect(screen.getByText("Limpieza")).toBeDefined();
    expect(screen.getByText("Mostrando 2 de 12 tratamientos")).toBeDefined();
    expect(screen.getAllByRole("button", { name: "Anterior" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Siguiente" }).length).toBeGreaterThan(0);
  });
});
