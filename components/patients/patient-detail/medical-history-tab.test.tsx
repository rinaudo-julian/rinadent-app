import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MedicalHistoryTab } from "./medical-history-tab";

vi.mock("@/hooks/use-medical-history", () => ({
  useMedicalHistory: vi.fn(),
}));

vi.mock("./create-medical-history-dialog", () => ({
  CreateMedicalHistoryDialog: ({ open }: { open: boolean }) =>
    open ? <div>Dialog abierto</div> : null,
}));

import { useMedicalHistory } from "@/hooks/use-medical-history";

describe("MedicalHistoryTab", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows empty-state message and create button when no history", () => {
    vi.mocked(useMedicalHistory).mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useMedicalHistory>);

    render(<MedicalHistoryTab patientId="123" />);

    expect(screen.getByText("No hay historial médico para este paciente")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Crear historial médico/i })).toBeTruthy();
  });

  it("opens dialog when clicking create button", async () => {
    const user = userEvent.setup();
    vi.mocked(useMedicalHistory).mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useMedicalHistory>);

    render(<MedicalHistoryTab patientId="123" />);

    await user.click(screen.getAllByRole("button", { name: /Crear historial médico/i })[0]);

    expect(screen.getByText("Dialog abierto")).toBeTruthy();
  });

  it("renders stored medical history when available", () => {
    vi.mocked(useMedicalHistory).mockReturnValue({
      isLoading: false,
      data: {
        id: "mh1",
        patient_id: "123",
        allergies: 1,
        heart_condition: 0,
        diabetes: 0,
        hypertension: 0,
        anticoagulation: 0,
        bisphosphonates: 0,
        osteoporosis: 0,
        hemophilia: 0,
        covid: 1,
        covid_observation: "Sin secuelas",
        bone_density_studies: 0,
        medications: "Ibuprofeno",
        oncological_treatment: "none",
        previous_lab_results: "normal",
        current_lab_results: "normal",
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    } as ReturnType<typeof useMedicalHistory>);

    render(<MedicalHistoryTab patientId="123" />);

    expect(screen.getByText("Historial Médico")).toBeTruthy();
    expect(screen.getByText("Alergias")).toBeTruthy();
    expect(screen.getAllByText("Sí").length).toBeGreaterThan(0);
  });
});
