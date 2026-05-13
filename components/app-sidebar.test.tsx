import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

vi.mock("@/components/logout-button", () => ({
  LogoutButton: () => <button type="button">Logout</button>
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false
}));

describe("AppSidebar", () => {
  it("includes Cuentas Corrientes navigation link", () => {
    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );

    const link = screen.getByRole("link", { name: /Cuentas Corrientes/i });
    expect(link.getAttribute("href")).toBe("/payments");
  });
});
