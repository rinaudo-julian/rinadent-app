import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardLayout from "@/app/(private)/layout";
import PaymentPatientLedgerPage from "@/app/(private)/budgets/[id]/payments/page";

let currentQuery = "page=1&limit=10";

const mockPush = vi.fn((url: string) => {
  const query = url.split("?")[1] ?? "";
  currentQuery = query;
});

const resolvedParams = {
  status: "fulfilled",
  value: { id: "123" },
  then: () => {}
} as unknown as Promise<{ id: string }>;

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegments: () => ["budgets", "123", "payments"],
  useSearchParams: vi.fn(() => new URLSearchParams(currentQuery)),
  usePathname: () => "/budgets/123/payments",
  useRouter: () => ({ push: mockPush })
}));

vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-provider">{children}</div>,
  SidebarInset: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarTrigger: () => <button type="button">Toggle</button>
}));

vi.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <aside>Sidebar</aside>
}));

vi.mock("@/components/patients/patient-search-command", () => ({
  PatientSearchCommand: () => <div>Search</div>
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <div role="separator" />
}));

describe("PaymentPatientLedgerPage runtime", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  function renderWithProviders() {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <DashboardLayout>
          <PaymentPatientLedgerPage params={resolvedParams} />
        </DashboardLayout>
      </QueryClientProvider>
    );
  }

  it("renders ledger without transactional CTAs", async () => {
    const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/api/budgets/123/summary")) {
        return {
          ok: true,
          json: async () => ({
            budgetId: "budget-1",
            patientId: "123",
            budgetDate: "2026-03-15T00:00:00.000Z",
            initialTotal: 310000,
            currentTotal: 372000,
            coveredTotal: 170000,
            pendingTotal: 202000,
            increaseAmount: 62000,
            increasePct: 20
          })
        } as Response;
      }

      if (url.includes("/api/budgets/123/payments?page=1&limit=10")) {
        return {
          ok: true,
          json: async () => ({
            data: [{ id: "m1", method: "Efectivo", amount: 100, created_at: "2026-04-01" }],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1
          })
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 1 })
      } as Response;
    });

    vi.stubGlobal("fetch", fetchSpy);

    renderWithProviders();

    expect(await screen.findByText("01/04/2026")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /crear|editar|cobrar|exportar/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /crear|editar|cobrar|exportar/i })).toBeNull();
  });

  it("renders in private layout/router context for /budgets/[id]/payments", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/api/budgets/123/summary")) {
          return {
            ok: true,
            json: async () => ({
              budgetId: "budget-1",
              patientId: "123",
              budgetDate: "2026-03-15T00:00:00.000Z",
              initialTotal: 310000,
              currentTotal: 372000,
              coveredTotal: 170000,
              pendingTotal: 202000,
              increaseAmount: 62000,
              increasePct: 20
            })
          } as Response;
        }

        return {
          ok: true,
          json: async () => ({
            data: [{ id: "m1", method: "Efectivo", amount: 100, created_at: "2026-04-01" }],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1
          })
        } as Response;
      })
    );

    renderWithProviders();

    expect(screen.getAllByText("RinaDent").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cuentas Corrientes").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Pagos del presupuesto" })).toBeTruthy();
    expect(await screen.findByText("01/04/2026")).toBeTruthy();
  });
});
