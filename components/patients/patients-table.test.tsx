import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PatientsTable } from "./patients-table";

vi.mock("@/hooks/use-patients", () => ({
  usePatients: vi.fn(),
}));

import { usePatients } from "@/hooks/use-patients";

describe("PatientsTable", () => {
  it("uses /patients/[id] for pencil action link", () => {
    vi.mocked(usePatients).mockReturnValue({
      data: {
        data: [
          {
            id: "12345678-1234-1234-1234-123456789012",
            first_name: "Juan",
            last_name: "Pérez",
            date_of_birth: "1990-01-15",
            street: "",
            street_number: "",
            locality: "",
            postal_code: "",
            gender: "male",
            condition_coverage: "private",
            phone: "3534184508",
            is_active: true,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof usePatients>);

    render(<PatientsTable />);

    const editLink = screen.getAllByText("Editar")[0].closest("a");
    expect(editLink?.getAttribute("href")).toBe("/patients/12345678-1234-1234-1234-123456789012");
  });
});
