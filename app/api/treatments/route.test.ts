import { beforeEach, describe, expect, it, vi } from "vitest";
import * as treatmentsRoute from "./route";

const { GET } = treatmentsRoute;

type MockQuery = ReturnType<typeof vi.fn> & {
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
};

const mockQuery = vi.fn() as MockQuery;

const initMock = () => {
  (mockQuery as unknown as Record<string, unknown>).from = vi.fn(
    () => mockQuery
  );
  mockQuery.select = vi.fn(() => mockQuery);
  mockQuery.order = vi.fn(() => mockQuery);
  mockQuery.or = vi.fn(() => mockQuery);
  mockQuery.range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
};

initMock();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: mockQuery.from.mockReturnValue(mockQuery)
  }))
}));

const BASE_URL = "http://localhost:3000";

describe("GET /api/treatments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initMock();
  });

  it("defaults to page=1 and limit=10", async () => {
    const request = new Request(`${BASE_URL}/api/treatments`);
    const response = await GET(request);
    const data = await response.json();

    expect(data.page).toBe(1);
    expect(data.limit).toBe(10);
    expect(mockQuery.range).toHaveBeenCalledWith(0, 9);
  });

  it("accepts whitelisted limit values", async () => {
    const request = new Request(`${BASE_URL}/api/treatments?page=2&limit=50`);
    const response = await GET(request);
    const data = await response.json();

    expect(data.page).toBe(2);
    expect(data.limit).toBe(50);
    expect(mockQuery.range).toHaveBeenCalledWith(50, 99);
  });

  it("falls back safely for invalid pagination params", async () => {
    const request = new Request(`${BASE_URL}/api/treatments?page=-2&limit=7`);
    const response = await GET(request);
    const data = await response.json();

    expect(data.page).toBe(1);
    expect(data.limit).toBe(10);
    expect(mockQuery.range).toHaveBeenCalledWith(0, 9);
  });

  it("applies search on code and name", async () => {
    const request = new Request(`${BASE_URL}/api/treatments?search=ort`);
    await GET(request);

    expect(mockQuery.or).toHaveBeenCalledWith("code.ilike.%ort%,name.ilike.%ort%");
  });

  it("returns filtered rows semantics for search results", async () => {
    const filteredRows = [
      { id: "1", code: "ORT-001", name: "Ortodoncia", created_at: "", updated_at: "" },
      { id: "2", code: "TR-002", name: "Control ortho", created_at: "", updated_at: "" }
    ];

    mockQuery.range.mockResolvedValueOnce({
      data: filteredRows,
      error: null,
      count: filteredRows.length
    });

    const request = new Request(`${BASE_URL}/api/treatments?search=ort`);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(2);
    expect(
      data.data.every((item: { code: string; name: string }) => {
        const normalizedCode = item.code.toLowerCase();
        const normalizedName = item.name.toLowerCase();
        return normalizedCode.includes("ort") || normalizedName.includes("ort");
      })
    ).toBe(true);
  });

  it("does not apply search when empty", async () => {
    const request = new Request(`${BASE_URL}/api/treatments?search=   `);
    await GET(request);

    expect(mockQuery.or).not.toHaveBeenCalled();
  });

  it("returns paginated contract", async () => {
    mockQuery.range.mockResolvedValueOnce({
      data: [
        { id: "1", code: "TR-001", name: "Limpieza", created_at: "", updated_at: "" }
      ],
      error: null,
      count: 21
    });

    const request = new Request(`${BASE_URL}/api/treatments`);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      data: [
        { id: "1", code: "TR-001", name: "Limpieza", created_at: "", updated_at: "" }
      ],
      total: 21,
      page: 1,
      limit: 10,
      totalPages: 3
    });
  });

  it("returns 500 on database error", async () => {
    mockQuery.range.mockResolvedValueOnce({
      data: null,
      error: { message: "DB failed" },
      count: null
    });

    const request = new Request(`${BASE_URL}/api/treatments`);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Error fetching treatments");
  });

  it("exposes GET-only handler surface", () => {
    expect(typeof treatmentsRoute.GET).toBe("function");
    expect("POST" in treatmentsRoute).toBe(false);
  });
});
