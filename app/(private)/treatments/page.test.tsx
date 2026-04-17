import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TreatmentsPage from "./page";

const mockPush = vi.fn();
const mockUseTreatments = vi.fn();

let mockSearchParams = new URLSearchParams();
let lastTableProps: unknown;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams
}));

vi.mock("@/hooks/use-treatments", () => ({
  useTreatments: (params: unknown) => mockUseTreatments(params)
}));

vi.mock("@/components/search-input", () => ({
  SearchInput: ({ basePath }: { basePath: string }) => (
    <div data-testid="search-input">SearchInput:{basePath}</div>
  )
}));

vi.mock("@/components/treatments/treatments-table", () => ({
  TreatmentsTable: (props: unknown) => {
    lastTableProps = props;
    return <div data-testid="treatments-table" />;
  }
}));

describe("TreatmentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    lastTableProps = undefined;

    mockUseTreatments.mockReturnValue({
      data: { items: [], total: 0, page: 1, limit: 10, totalPages: 3 },
      states: { isLoading: false, isError: false, error: null },
      methods: { refetch: vi.fn() }
    });
  });

  it("renders page shell with title, search input and table", () => {
    render(<TreatmentsPage />);

    expect(screen.getByRole("heading", { name: "Tratamientos" })).toBeDefined();
    expect(screen.getByTestId("search-input")).toBeDefined();
    expect(screen.getByTestId("treatments-table")).toBeDefined();
    expect(mockUseTreatments).toHaveBeenCalledWith({ page: 1, limit: 10, search: "" });
  });

  it("updates query params when table requests a valid page change", () => {
    render(<TreatmentsPage />);

    const props = lastTableProps as {
      methods: { onPageChange: (page: number) => void };
    };

    props.methods.onPageChange(2);

    expect(mockPush).toHaveBeenCalledWith("/treatments?page=2&limit=10");
  });
});
