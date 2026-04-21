import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mockOrder = vi.fn();
const mockSelect = vi.fn(() => ({ order: mockOrder }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom
  }))
}));

describe("GET /api/treatments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns mapped fields for treatments rows", async () => {
    mockOrder.mockResolvedValueOnce({
      data: [{ code: "001", name: "Limpieza", price: "1000.00" }],
      error: null
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([{ code: "001", name: "Limpieza", price: 1000 }]);
  });

  it("returns an empty array when there are no treatments", async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });
});
