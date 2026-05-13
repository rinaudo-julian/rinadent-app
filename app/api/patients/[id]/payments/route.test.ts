import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const mockRange = vi.fn();
const mockOrder = vi.fn(() => ({ range: mockRange }));
const mockEq = vi.fn(() => ({ order: mockOrder }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom
  }))
}));

const validUUID = "12345678-1234-1234-1234-123456789012";

describe("GET /api/patients/[id]/payments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated patient payments", async () => {
    mockRange.mockResolvedValueOnce({
      data: [
        {
          id: "pay-1",
          amount: 5000,
          created_at: "2026-05-10T12:00:00.000Z",
          payment_methods: { name: "Transferencia" }
        }
      ],
      count: 1,
      error: null
    });

    const response = await GET(new Request("http://localhost:3000/api/patients/123/payments?page=1&limit=10"), {
      params: Promise.resolve({ id: validUUID })
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      data: [
        {
          id: "pay-1",
          method: "Transferencia",
          amount: 5000,
          created_at: "2026-05-10T12:00:00.000Z"
        }
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1
    });
  });

  it("returns 400 when patient id is invalid", async () => {
    const response = await GET(new Request("http://localhost:3000/api/patients/nope/payments"), {
      params: Promise.resolve({ id: "nope" })
    });

    expect(response.status).toBe(400);
  });
});
