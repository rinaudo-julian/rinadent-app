import { beforeEach, describe, expect, it, vi } from "vitest";
import { PUT } from "./route";

const mockRpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    rpc: mockRpc
  }))
}));

const BASE_URL = "http://localhost:3000";

type TreatmentsStore = Record<string, number>;

function createRequest(body: unknown) {
  return new Request(`${BASE_URL}/api/treatments/bulk`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

function createInMemoryBulkUpdater(initialTreatments: TreatmentsStore) {
  const db = new Map<string, number>(Object.entries(initialTreatments));

  mockRpc.mockImplementationOnce(
    async (
      functionName: string,
      params: { p_codes: string[]; p_mode: "unit" | "percentage"; p_value: number }
    ) => {
      if (functionName !== "bulk_update_treatment_prices") {
        return { data: null, error: { message: "unknown_function" } };
      }

      const next = new Map(db);

      for (const code of params.p_codes) {
        if (!next.has(code)) {
          return { data: null, error: { message: `missing_codes:${code}` } };
        }
      }

      for (const code of params.p_codes) {
        const currentPrice = next.get(code);

        if (typeof currentPrice !== "number") {
          return { data: null, error: { message: `invalid_price:${code}` } };
        }

        const computed =
          params.p_mode === "unit"
            ? currentPrice + params.p_value
            : Math.round(currentPrice * (1 + params.p_value / 100) * 100) / 100;

        next.set(code, computed);
      }

      db.clear();
      next.forEach((value, code) => {
        db.set(code, value);
      });

      return { data: params.p_codes.length, error: null };
    }
  );

  return {
    getPrice(code: string) {
      return db.get(code);
    }
  };
}

describe("PUT /api/treatments/bulk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists unit update outcome (100 + 1000 = 1100)", async () => {
    const treatments = createInMemoryBulkUpdater({ "001": 100 });

    const response = await PUT(
      createRequest({ codes: ["001"], mode: "unit", value: 1000 })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ updatedCount: 1 });
    expect(treatments.getPrice("001")).toBe(1100);
  });

  it("persists percentage update outcome (1000 + 3% = 1030)", async () => {
    const treatments = createInMemoryBulkUpdater({ "001": 1000 });

    const response = await PUT(
      createRequest({ codes: ["001"], mode: "percentage", value: 3 })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ updatedCount: 1 });
    expect(treatments.getPrice("001")).toBe(1030);
  });

  it("rolls back all changes when one code is invalid", async () => {
    const treatments = createInMemoryBulkUpdater({ "001": 100, "002": 250 });

    const response = await PUT(
      createRequest({ codes: ["001", "INVALID"], mode: "unit", value: 1000 })
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Error updating treatment prices");
    expect(data.details).toContain("missing_codes:INVALID");
    expect(treatments.getPrice("001")).toBe(100);
    expect(treatments.getPrice("002")).toBe(250);
  });

  it("returns 400 for negative value and does not execute rpc", async () => {
    const response = await PUT(
      createRequest({ codes: ["001"], mode: "unit", value: -1 })
    );

    expect(response.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });
});
