import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import {
  DataTablePagination,
  DEFAULT_PAGE_SIZE_OPTIONS
} from "@/components/data-table/data-table-pagination";
import { ALLOWED_LIMITS } from "@/lib/pagination";

describe("DataTablePagination", () => {
  it("calls onPageChange when selecting a specific page", () => {
    const onPageChange = vi.fn();

    render(
      <DataTablePagination
        page={2}
        pageSize={10}
        totalItems={100}
        totalPages={10}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByRole("link", { name: "3" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("uses shared page size options by default", () => {
    expect(DEFAULT_PAGE_SIZE_OPTIONS).toEqual(ALLOWED_LIMITS);
  });

  it("tolerates empty dataset pagination without crashing", () => {
    render(
      <DataTablePagination
        page={1}
        pageSize={10}
        totalItems={0}
        totalPages={0}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText("Mostrando 0 de 0 resultados")).toBeTruthy();
    expect(screen.getByRole("link", { name: "1" })).toBeTruthy();
  });
});
