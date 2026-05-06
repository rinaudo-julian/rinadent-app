import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PatientDetailView } from "./patient-detail-view";

vi.mock("./medical-history-tab", () => ({
  MedicalHistoryTab: () => <h3>Contenido Historial Médico</h3>,
}));

vi.mock("./odontograma-tab", () => ({
  OdontogramaTab: () => <h3>Odontograma</h3>,
}));

vi.mock("./estudios-tab", () => ({
  EstudiosTab: ({ patientId }: { patientId: string }) => (
    <div>
      <h3>Estudios</h3>
      <p>Patient {patientId}</p>
    </div>
  ),
}));

describe("PatientDetailView", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders three tabs", () => {
    render(<PatientDetailView patientId="123" />);

    expect(screen.getByRole("tab", { name: "Historial Médico" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Odontograma" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Estudios" })).toBeTruthy();
  });

  it("switches tab content when clicking tabs", async () => {
    const user = userEvent.setup();
    render(<PatientDetailView patientId="123" />);

    expect(screen.getAllByText("Contenido Historial Médico").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("tab", { name: "Odontograma" }));
    const odontogramaPanel = screen.getByRole("tabpanel", { name: "Odontograma" });
    expect(within(odontogramaPanel).getByRole("heading", { name: "Odontograma" })).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: "Estudios" }));
    const estudiosPanel = screen.getByRole("tabpanel", { name: "Estudios" });
    expect(within(estudiosPanel).getByRole("heading", { name: "Estudios" })).toBeTruthy();
    expect(within(estudiosPanel).getByText("Patient 123")).toBeTruthy();

  });
});
