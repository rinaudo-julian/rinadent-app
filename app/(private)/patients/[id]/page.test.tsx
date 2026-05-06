import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    use: vi.fn(() => ({ id: "12345678-1234-1234-1234-123456789012" })),
  };
});

vi.mock("@/hooks/use-patient", () => ({
  usePatient: vi.fn(),
}));

vi.mock("@/components/patients/patient-detail/patient-detail-view", () => ({
  PatientDetailView: ({ patientId }: { patientId: string }) => (
    <div>PatientDetailView {patientId}</div>
  ),
}));

vi.mock("@/components/private-breadcrumbs-context", () => ({
  usePrivateBreadcrumbs: () => ({
    setCurrentPageLabel: vi.fn(),
  }),
}));

import PatientDetailPage from "./page";
import { usePatient } from "@/hooks/use-patient";

describe("PatientDetailPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders patient full name when patient exists", () => {
    vi.mocked(usePatient).mockReturnValue({
      data: {
        id: "12345678-1234-1234-1234-123456789012",
        first_name: "Juan",
        last_name: "Pérez",
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof usePatient>);

    render(
      <PatientDetailPage
        params={Promise.resolve({ id: "12345678-1234-1234-1234-123456789012" })}
      />
    );

    expect(screen.getByRole("heading", { name: "Juan Pérez" })).toBeTruthy();
  });

  it("renders not-found style state when patient is missing", () => {
    vi.mocked(usePatient).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Paciente no encontrado"),
    } as unknown as ReturnType<typeof usePatient>);

    render(
      <PatientDetailPage
        params={Promise.resolve({ id: "12345678-1234-1234-1234-123456789012" })}
      />
    );

    expect(screen.getByText("Paciente no encontrado")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /Volver a pacientes/i })[0]).toBeTruthy();
  });
});
