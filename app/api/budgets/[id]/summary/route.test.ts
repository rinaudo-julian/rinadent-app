import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const mockMaybeSingle = vi.fn();
const mockEqBudget = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelectBudget = vi.fn(() => ({ eq: mockEqBudget }));

const mockEqItems = vi.fn();
const mockSelectItems = vi.fn(() => ({ eq: mockEqItems }));

const mockEqPayments = vi.fn();
const mockSelectPayments = vi.fn(() => ({ eq: mockEqPayments }));

const mockFrom = vi.fn((table: string) => {
  if (table === "patient_budgets") return { select: mockSelectBudget };
  if (table === "patient_budget_items") return { select: mockSelectItems };
  if (table === "payments") return { select: mockSelectPayments };
  return { select: vi.fn() };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom
  }))
}));

const validUUID = "12345678-1234-1234-1234-123456789012";

describe("GET /api/budgets/[id]/summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("recalculates current total when treatment prices change and budget is not settled", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        id: "budget-1",
        patient_id: "patient-1",
        budget_number: "PRES-2026-0001",
        initial_total: 10000,
        created_at: "2026-03-15T00:00:00.000Z",
        settled_paid_total: null
      },
      error: null
    });

    mockEqPayments.mockResolvedValue({
      data: [{ amount: 10000 }],
      error: null
    });

    mockEqItems
      .mockResolvedValueOnce({
        data: [{ quantity: 1, treatments: { price: 10000 } }],
        error: null
      })
      .mockResolvedValueOnce({
        data: [{ quantity: 1, treatments: { price: 13000 } }],
        error: null
      });

    const firstResponse = await GET(new Request("http://localhost:3000/api/budgets/123/summary"), {
      params: Promise.resolve({ id: validUUID })
    });
    const firstBody = await firstResponse.json();

    const secondResponse = await GET(new Request("http://localhost:3000/api/budgets/123/summary"), {
      params: Promise.resolve({ id: validUUID })
    });
    const secondBody = await secondResponse.json();

    expect(firstResponse.status).toBe(200);
    expect(firstBody.currentTotal).toBe(10000);
    expect(firstBody.pendingTotal).toBe(0);

    expect(secondResponse.status).toBe(200);
    expect(secondBody.currentTotal).toBe(13000);
    expect(secondBody.pendingTotal).toBe(3000);
    expect(secondBody.increaseAmount).toBe(3000);
    expect(secondBody.increasePct).toBe(30);
  });

  it("uses settled paid total as source of truth when budget is settled", async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: "budget-1",
        patient_id: "patient-1",
        budget_number: "PRES-2026-0001",
        initial_total: 10000,
        created_at: "2026-03-15T00:00:00.000Z",
        settled_paid_total: 12000
      },
      error: null
    });

    mockEqPayments.mockResolvedValueOnce({
      data: [{ amount: 12000 }],
      error: null
    });

    const response = await GET(new Request("http://localhost:3000/api/budgets/123/summary"), {
      params: Promise.resolve({ id: validUUID })
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockEqItems).not.toHaveBeenCalled();
    expect(body.currentTotal).toBe(12000);
    expect(body.coveredTotal).toBe(12000);
    expect(body.pendingTotal).toBe(0);
  });
});
