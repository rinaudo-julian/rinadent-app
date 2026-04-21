import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TreatmentsSidebarView } from "./treatments-sidebar-view";
import type { UseTreatmentsSidebarViewLogicResult } from "@/hooks/useTreatmentsSidebarViewLogic";

function createLogic(
  overrides: Partial<UseTreatmentsSidebarViewLogicResult>
): UseTreatmentsSidebarViewLogicResult {
  return {
    data: {
      treatments: [
        {
          code: "001",
          name: "Limpieza",
          price: 1000
        }
      ],
      selectedCodes: ["001"],
      form: {
        isDialogOpen: false,
        mode: "unit",
        unitValue: "",
        percentageValue: "",
        validationError: null
      }
    },
    states: {
      isLoading: false,
      isFetchError: false,
      isSubmitting: false,
      isUpdateError: false,
      isUnitInputDisabled: false,
      isPercentageInputDisabled: true
    },
    methods: {
      toggleSelection: vi.fn(),
      toggleAllSelection: vi.fn(),
      setDialogOpen: vi.fn(),
      setMode: vi.fn(),
      setUnitValue: vi.fn(),
      setPercentageValue: vi.fn(),
      clearUpdateError: vi.fn(),
      submitBulkUpdate: vi.fn(async () => true)
    },
    ...overrides
  };
}

describe("TreatmentsSidebarView", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders Código, Tipo de tratamiento and Precio columns mapped from code/name/price", () => {
    render(<TreatmentsSidebarView logic={createLogic({})} />);

    expect(screen.getByRole("columnheader", { name: "Código" })).toBeTruthy();
    expect(
      screen.getByRole("columnheader", { name: "Tipo de tratamiento" })
    ).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Precio" })).toBeTruthy();
    expect(screen.getByText("001")).toBeTruthy();
    expect(screen.getByText("Limpieza")).toBeTruthy();
    expect(screen.getByText(/1\.000,00/)).toBeTruthy();
  });

  it("renders empty state and disables bulk actions when there is no data", () => {
    render(
      <TreatmentsSidebarView
        logic={
          createLogic({
            data: {
              treatments: [],
              selectedCodes: [],
              form: {
                isDialogOpen: false,
                mode: "unit",
                unitValue: "",
                percentageValue: "",
                validationError: null
              }
            }
          })
        }
      />
    );

    expect(screen.getByText("No hay tratamientos cargados.")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Actualizar precios" }).hasAttribute("disabled")
    ).toBe(true);
  });

  it("renders fetch-error state and disables bulk actions", () => {
    render(
      <TreatmentsSidebarView
        logic={
          createLogic({
            states: {
              isLoading: false,
              isFetchError: true,
              isSubmitting: false,
              isUpdateError: false,
              isUnitInputDisabled: false,
              isPercentageInputDisabled: true
            },
            data: {
              treatments: [],
              selectedCodes: [],
              form: {
                isDialogOpen: false,
                mode: "unit",
                unitValue: "",
                percentageValue: "",
                validationError: null
              }
            }
          })
        }
      />
    );

    expect(screen.getByText("No se pudieron cargar los tratamientos.")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Actualizar precios" }).hasAttribute("disabled")
    ).toBe(true);
  });

  it("renders update-error state", () => {
    render(
      <TreatmentsSidebarView
        logic={
          createLogic({
            states: {
              isLoading: false,
              isFetchError: false,
              isSubmitting: false,
              isUpdateError: true,
              isUnitInputDisabled: false,
              isPercentageInputDisabled: true
            }
          })
        }
      />
    );

    expect(
      screen.getByText("No se pudo actualizar precios. Reintentá nuevamente.")
    ).toBeTruthy();
  });
});
