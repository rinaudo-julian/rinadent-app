import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBudgetLedger } from "@/hooks/use-budget-ledger";
import { PatientLedgerView } from "@/components/payments/patient-ledger-view";

let currentQuery = "page=1&limit=10";

const mockPush = vi.fn((url: string) => {
  const query = url.split("?")[1] ?? "";
  currentQuery = query;
});

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams(currentQuery)),
  usePathname: () => "/budgets/123/payments",
  useRouter: () => ({ push: mockPush })
}));

function Harness() {
  const ledger = useBudgetLedger("123");
  return <PatientLedgerView analytics={ledger.analytics} rows={ledger.rows} pagination={ledger.pagination} />;
}

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("Patient ledger integration", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    currentQuery = "page=1&limit=10";
    mockPush.mockClear();

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

        if (url.includes("/api/budgets/123/payments?page=1&limit=10")) {
          return {
            ok: true,
            json: async () => ({
              data: [{ id: "m1", method: "Efectivo", amount: 100, created_at: "2026-04-01" }],
              total: 11,
              page: 1,
              limit: 10,
              totalPages: 2
            })
          } as Response;
        }

        if (url.includes("/api/budgets/123/payments?page=2&limit=10")) {
          return {
            ok: true,
            json: async () => ({
              data: [{ id: "m11", method: "Tarjeta", amount: 100, created_at: "2026-04-30" }],
              total: 11,
              page: 2,
              limit: 10,
              totalPages: 2
            })
          } as Response;
        }

        return {
          ok: true,
          json: async () => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 1 })
        } as Response;
      })
    );
  });

  it("updates query params and visible rows when changing page", async () => {
    const { rerender } = renderWithQueryClient(<Harness />);

    expect(await screen.findByText("01/04/2026")).toBeTruthy();
    expect(screen.queryByText("30/04/2026")).toBeNull();

    fireEvent.click(screen.getByRole("link", { name: "Go to next page" }));

    expect(mockPush).toHaveBeenCalledWith("/budgets/123/payments?page=2&limit=10");

    rerender(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <Harness />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("30/04/2026")).toBeTruthy();
    });
    expect(screen.queryByText("01/04/2026")).toBeNull();
  });
});
