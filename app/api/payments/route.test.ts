import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const mockRange = vi.fn();
const mockOrder = vi.fn(() => ({ range: mockRange }));
const mockSelect = vi.fn(() => ({ order: mockOrder }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom
  }))
}));

describe("GET /api/payments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated recent payments with budget reference", async () => {
    mockRange.mockResolvedValueOnce({
      data: [
        {
          amount: 10000,
          created_at: "2026-05-10T12:00:00.000Z",
          payment_methods: { name: "Efectivo" },
          patient_budgets: {
            id: "budget-1",
            budget_number: "PRES-2026-0001",
            patients: { first_name: "Ana", last_name: "Pérez" }
          }
        }
      ],
      count: 1,
      error: null
    });

    const response = await GET(new Request("http://localhost:3000/api/payments?page=1&limit=10"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      data: [
        {
          budget_id: "budget-1",
          budget_number: "PRES-2026-0001",
          first_name: "Ana",
          last_name: "Pérez",
          method: "Efectivo",
          amount: 10000,
          created_at: "2026-05-10T12:00:00.000Z"
        }
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1
    });
  });

  it("returns 500 when query fails", async () => {
    mockRange.mockResolvedValueOnce({
      data: null,
      count: null,
      error: { message: "DB failed" }
    });

    const response = await GET(new Request("http://localhost:3000/api/payments?page=1&limit=10"));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "Error fetching payments", details: "DB failed" });
  });
});
