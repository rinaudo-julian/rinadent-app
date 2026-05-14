import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { PrivateBreadcrumbs } from "@/components/private-breadcrumbs";

const mockUseSelectedLayoutSegments = vi.fn(() => ["payments"]);

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegments: () => mockUseSelectedLayoutSegments()
}));

vi.mock("@/components/private-breadcrumbs-context", () => ({
  usePrivateBreadcrumbs: () => ({
    currentPageLabel: null
  })
}));

describe("PrivateBreadcrumbs", () => {
  it("renders friendly label for payments segment", () => {
    render(<PrivateBreadcrumbs />);

    expect(screen.getByText("Cuentas Corrientes")).toBeTruthy();
  });
});
