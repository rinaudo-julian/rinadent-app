import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const mockLimit = vi.fn();
const mockOrder = vi.fn(() => ({ limit: mockLimit }));
const mockEqBudgets = vi.fn(() => ({ order: mockOrder }));
const mockSelectBudgets = vi.fn(() => ({ eq: mockEqBudgets }));

const mockEqItems = vi.fn();
const mockSelectItems = vi.fn(() => ({ eq: mockEqItems }));

const mockEqPayments = vi.fn();
const mockSelectPayments = vi.fn(() => ({ eq: mockEqPayments }));

const mockFrom = vi.fn((table: string) => {
  if (table === "patient_budgets") return { select: mockSelectBudgets };
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

describe("GET /api/patients/[id]/budget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns summary values from budget, items and payments", async () => {
    mockLimit.mockResolvedValueOnce({
      data: [
        {
          id: "budget-1",
          initial_total: 10000,
          created_at: "2026-03-15T00:00:00.000Z",
          settled_at: null,
          settled_paid_total: null
        }
      ],
      error: null
    });

    mockEqItems.mockResolvedValueOnce({
      data: [
        { quantity: 2, treatments: { price: 6000 } },
        { quantity: 1, treatments: { price: 3000 } }
      ],
      error: null
    });

    mockEqPayments.mockResolvedValueOnce({
      data: [{ amount: 5000 }, { amount: 2000 }],
      error: null
    });

    const response = await GET(new Request("http://localhost:3000/api/patients/123/budget"), {
      params: Promise.resolve({ id: validUUID })
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      budgetId: "budget-1",
      patientId: validUUID,
      budgetDate: "2026-03-15T00:00:00.000Z",
      initialTotal: 10000,
      currentTotal: 15000,
      coveredTotal: 7000,
      pendingTotal: 8000,
      increaseAmount: 5000,
      increasePct: 50
    });
  });

  it("returns zeroed summary when patient has no budget", async () => {
    mockLimit.mockResolvedValueOnce({ data: [], error: null });

    const response = await GET(new Request("http://localhost:3000/api/patients/123/budget"), {
      params: Promise.resolve({ id: validUUID })
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      budgetId: null,
      patientId: validUUID,
      budgetDate: null,
      initialTotal: 0,
      currentTotal: 0,
      coveredTotal: 0,
      pendingTotal: 0,
      increaseAmount: 0,
      increasePct: 0
    });
  });

  it("recalculates current total when treatment prices change and budget is not settled", async () => {
    mockLimit.mockResolvedValue({
      data: [
        {
          id: "budget-1",
          initial_total: 10000,
          created_at: "2026-03-15T00:00:00.000Z",
          settled_at: null,
          settled_paid_total: null
        }
      ],
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

    const firstResponse = await GET(new Request("http://localhost:3000/api/patients/123/budget"), {
      params: Promise.resolve({ id: validUUID })
    });
    const firstBody = await firstResponse.json();

    const secondResponse = await GET(new Request("http://localhost:3000/api/patients/123/budget"), {
      params: Promise.resolve({ id: validUUID })
    });
    const secondBody = await secondResponse.json();

    expect(firstResponse.status).toBe(200);
    expect(firstBody.currentTotal).toBe(10000);
    expect(firstBody.pendingTotal).toBe(0);
    expect(firstBody.increasePct).toBe(0);

    expect(secondResponse.status).toBe(200);
    expect(secondBody.currentTotal).toBe(13000);
    expect(secondBody.pendingTotal).toBe(3000);
    expect(secondBody.increaseAmount).toBe(3000);
    expect(secondBody.increasePct).toBe(30);
  });

  it("uses settled paid total as source of truth when budget is settled", async () => {
    mockLimit.mockResolvedValueOnce({
      data: [
        {
          id: "budget-1",
          initial_total: 10000,
          created_at: "2026-03-15T00:00:00.000Z",
          settled_at: "2026-04-01T12:00:00.000Z",
          settled_paid_total: 12000
        }
      ],
      error: null
    });

    mockEqPayments.mockResolvedValueOnce({
      data: [{ amount: 12000 }],
      error: null
    });

    const response = await GET(new Request("http://localhost:3000/api/patients/123/budget"), {
      params: Promise.resolve({ id: validUUID })
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockEqItems).not.toHaveBeenCalled();
    expect(body.currentTotal).toBe(12000);
    expect(body.coveredTotal).toBe(12000);
    expect(body.pendingTotal).toBe(0);
    expect(body.increaseAmount).toBe(2000);
    expect(body.increasePct).toBe(20);
  });
});
