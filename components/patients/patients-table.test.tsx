import { beforeEach, describe, it, expect, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DataTable } from "@/components/data-table/data-table";
import { patientsTableColumns } from "@/components/patients/patients-table-columns";
import { usePatients } from "@/hooks/use-patients";
import { usePagination } from "@/hooks/usePagination";

const mockPush = vi.fn();

vi.mock("@/hooks/use-patients", () => ({
  usePatients: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
   usePathname: () => "/patients",
  useRouter: () => ({
    push: mockPush,
  }),
}));

import { useSearchParams } from "next/navigation";

function PatientsTableHarness() {
  const searchParams = useSearchParams();
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const search = searchParams.get("search") ?? "";

  const { data } = usePatients({
    page,
    limit: pageSize,
    search,
  });

  const patients = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <DataTable
      columns={patientsTableColumns}
      data={patients}
      pagination={{
        page,
        pageSize,
        totalItems: total,
        totalPages,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
    />
  );
}

function createSearchParams(query: string): ReturnType<typeof useSearchParams> {
  return new URLSearchParams(query) as unknown as ReturnType<typeof useSearchParams>;
}

const mockPatient = {
  id: "12345678-1234-1234-1234-123456789012",
  first_name: "Juan",
  last_name: "Pérez",
  dni: "30123456",
  date_of_birth: "1990-01-15",
  street: "",
  street_number: "",
  locality: "Buenos Aires",
  postal_code: "",
  gender: "male" as const,
  condition_coverage: "private" as const,
  phone: "3534184508",
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

describe("Patients data table", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockPush.mockClear();
    vi.mocked(useSearchParams).mockReturnValue(createSearchParams(""));
  });

  it("renders patient full name as link to /patients/[id]", () => {
    vi.mocked(usePatients).mockReturnValue({
      data: {
        data: [mockPatient],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof usePatients>);

    render(<PatientsTableHarness />);

    const nameLink = screen.getByRole("link", { name: "Juan Pérez" });

    expect(nameLink.getAttribute("href")).toBe("/patients/12345678-1234-1234-1234-123456789012");
  });

  it("uses URL query params to fetch patients", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      createSearchParams("page=2&limit=20&search=maria")
    );
    vi.mocked(usePatients).mockReturnValue({
      data: {
        data: [mockPatient],
        total: 1,
        page: 2,
        limit: 20,
        totalPages: 1,
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof usePatients>);

    render(<PatientsTableHarness />);

    expect(usePatients).toHaveBeenCalledWith({
      page: 2,
      limit: 20,
      search: "maria",
    });
  });

  it("sorts by Paciente when clicking the header", () => {
    vi.mocked(usePatients).mockReturnValue({
      data: {
        data: [
          {
            ...mockPatient,
            id: "1",
            first_name: "Zoe",
            last_name: "Zuluaga",
          },
          {
            ...mockPatient,
            id: "2",
            first_name: "Ana",
            last_name: "Acosta",
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof usePatients>);

    const { container } = render(<PatientsTableHarness />);

    const getFirstNameCell = () =>
      container.querySelector("tbody tr td")?.textContent ?? "";

    expect(getFirstNameCell()).toContain("Zoe Zuluaga");

    fireEvent.click(screen.getByRole("button", { name: "Paciente" }));

    expect(getFirstNameCell()).toContain("Ana Acosta");
  });

  it("renders Teléfono, Localidad y Edad columns", () => {
    vi.mocked(usePatients).mockReturnValue({
      data: {
        data: [mockPatient],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof usePatients>);

    render(<PatientsTableHarness />);

    expect(screen.getByRole("columnheader", { name: "Teléfono" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Localidad" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Edad" })).toBeTruthy();
    expect(screen.getByText("3534184508")).toBeTruthy();
    expect(screen.getByText("Buenos Aires")).toBeTruthy();
  });

  it("updates URL params when changing page from pagination", () => {
    vi.mocked(useSearchParams).mockReturnValue(createSearchParams("page=2&limit=20&search=maria"));
    vi.mocked(usePatients).mockReturnValue({
      data: {
        data: [mockPatient],
        total: 60,
        page: 2,
        limit: 20,
        totalPages: 3,
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof usePatients>);

    render(<PatientsTableHarness />);

    fireEvent.click(screen.getByRole("link", { name: "Go to next page" }));

    expect(mockPush).toHaveBeenCalledWith("/patients?page=3&limit=20&search=maria");
  });
});
