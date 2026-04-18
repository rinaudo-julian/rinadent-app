import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";

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
});
