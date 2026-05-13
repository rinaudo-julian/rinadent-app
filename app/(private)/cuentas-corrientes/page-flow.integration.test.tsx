import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PaymentsPage from "@/app/(private)/payments/page";
import { AppSidebar } from "@/components/app-sidebar";
import { PrivateBreadcrumbs } from "@/components/private-breadcrumbs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useCuentasCorrientesLogic } from "@/hooks/useCuentasCorrientesLogic";

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false
}));

vi.mock("@/components/logout-button", () => ({
  LogoutButton: () => <button type="button">Logout</button>
}));

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegments: () => ["payments"]
}));

vi.mock("@/components/private-breadcrumbs-context", () => ({
  usePrivateBreadcrumbs: () => ({ currentPageLabel: null })
}));

vi.mock("@/components/cuentas-corrientes/cuentas-corrientes-table", () => ({
  CuentasCorrientesTable: ({ data }: { data: unknown[] }) => (
    <div data-testid="cuentas-corrientes-table">rows:{data.length}</div>
  )
}));

vi.mock("@/hooks/useCuentasCorrientesLogic", () => ({
  useCuentasCorrientesLogic: vi.fn()
}));

describe("cuentas-corrientes private flow integration", () => {
  it("renders discoverability and private page flow end-to-end at component integration layer", () => {
    vi.mocked(useCuentasCorrientesLogic).mockReturnValue({
      data: {
        rows: [],
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
      },
      states: {
        isLoading: false,
        isError: false,
        error: null
      },
      methods: {
        setPage: vi.fn(),
        setPageSize: vi.fn(),
        refetch: vi.fn()
      }
    });

    render(
    <SidebarProvider>
      <AppSidebar />
      <PrivateBreadcrumbs />
      <PaymentsPage />
    </SidebarProvider>
    );

    const cuentasLink = screen
      .getAllByRole("link", { name: /Cuentas Corrientes/i })
      .find((link) => link.getAttribute("href") === "/payments");
    expect(cuentasLink).toBeTruthy();
    expect(cuentasLink?.getAttribute("href")).toBe("/payments");
    expect(screen.getAllByText("Cuentas Corrientes").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Cuentas Corrientes" })).toBeTruthy();
    expect(screen.getByTestId("cuentas-corrientes-table").textContent).toContain("rows:0");
  });
});
