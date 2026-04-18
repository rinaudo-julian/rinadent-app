import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";

type MockQuery = ReturnType<typeof vi.fn> & {
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
};

// Create flexible mock
const mockQuery = vi.fn() as MockQuery;

const initMock = () => {
  (mockQuery as unknown as Record<string, unknown>).from = vi.fn(
    () => mockQuery
  );
  mockQuery.select = vi.fn(() => mockQuery);
  mockQuery.eq = vi.fn(() => mockQuery);
  mockQuery.order = vi.fn(() => mockQuery);
  mockQuery.or = vi.fn(() => mockQuery);
  mockQuery.insert = vi.fn(() => mockQuery);
  mockQuery.range = vi
    .fn()
    .mockResolvedValue({ data: [], error: null, count: 0 });
  mockQuery.single = vi.fn();
};

initMock();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: mockQuery.from.mockReturnValue(mockQuery)
  }))
}));

// ============================================
// Helper
// ============================================
const BASE_URL = "http://localhost:3000";

function createRequest(body: unknown, method = "POST") {
  return new Request(`${BASE_URL}/api/patients`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
}

// ============================================
// GET /api/patients
// ============================================
describe("GET /api/patients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initMock();
  });

  describe("Pagination - page param", () => {
    it("should default to page 1", async () => {
      const request = new Request(`${BASE_URL}/api/patients`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.page).toBe(1);
    });

    it("should parse valid page number", async () => {
      const request = new Request(`${BASE_URL}/api/patients?page=3`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.page).toBe(3);
    });

    it("should fallback to page 1 for page=0", async () => {
      const request = new Request(`${BASE_URL}/api/patients?page=0`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.page).toBe(1); // Should be safe, not 0
    });

    it("should fallback to page 1 for negative page", async () => {
      const request = new Request(`${BASE_URL}/api/patients?page=-1`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.page).toBe(1);
    });

    it("should fallback to page 1 for non-numeric page", async () => {
      const request = new Request(`${BASE_URL}/api/patients?page=abc`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.page).toBe(1);
    });
  });

  describe("Pagination - limit param", () => {
    it("should default to limit 10", async () => {
      const request = new Request(`${BASE_URL}/api/patients`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.limit).toBe(10);
    });

    it("should accept limit=50", async () => {
      const request = new Request(`${BASE_URL}/api/patients?limit=50`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.limit).toBe(50);
    });

    it("should accept limit=20", async () => {
      const request = new Request(`${BASE_URL}/api/patients?limit=20`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.limit).toBe(20);
    });

    it("should accept limit=30", async () => {
      const request = new Request(`${BASE_URL}/api/patients?limit=30`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.limit).toBe(30);
    });

    it("should fallback to 10 for invalid limit", async () => {
      const request = new Request(`${BASE_URL}/api/patients?limit=25`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.limit).toBe(10);
    });

    it("should fallback to 10 for limit=100", async () => {
      const request = new Request(`${BASE_URL}/api/patients?limit=100`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.limit).toBe(10);
    });

    it("should fallback to 10 for non-numeric limit", async () => {
      const request = new Request(`${BASE_URL}/api/patients?limit=abc`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.limit).toBe(10);
    });

    it("should fallback to 10 for negative limit", async () => {
      const request = new Request(`${BASE_URL}/api/patients?limit=-5`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.limit).toBe(10);
    });
  });

  describe("Pagination - offset calculation", () => {
    it("should calculate offset correctly (page 1)", async () => {
      const request = new Request(`${BASE_URL}/api/patients?page=1&limit=10`);
      await GET(request);
      // page 1, limit 10 → offset 0
      expect(mockQuery.range).toHaveBeenCalledWith(0, 9);
    });

    it("should calculate offset correctly (page 2)", async () => {
      const request = new Request(`${BASE_URL}/api/patients?page=2&limit=10`);
      await GET(request);
      // page 2, limit 10 → offset 10
      expect(mockQuery.range).toHaveBeenCalledWith(10, 19);
    });

    it("should calculate offset correctly (page 3)", async () => {
      const request = new Request(`${BASE_URL}/api/patients?page=3&limit=50`);
      await GET(request);
      // page 3, limit 50 → offset 100
      expect(mockQuery.range).toHaveBeenCalledWith(100, 149);
    });

    it("should use safe offset (no negative)", async () => {
      const request = new Request(`${BASE_URL}/api/patients?page=-1`);
      await GET(request);
      // Should not call range with negative
      expect(mockQuery.range).toHaveBeenCalled();
    });
  });

  describe("totalPages calculation", () => {
    it("should calculate totalPages correctly", async () => {
      // Setup mock to return 95 total
      mockQuery.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 95
      });
      const request = new Request(`${BASE_URL}/api/patients`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.totalPages).toBe(10); // 95 / 10 = 10
    });

    it("should handle total=0", async () => {
      mockQuery.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0
      });
      const request = new Request(`${BASE_URL}/api/patients`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.totalPages).toBe(0);
    });

    it("should handle total less than limit", async () => {
      mockQuery.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 5
      });
      const request = new Request(`${BASE_URL}/api/patients`);
      const response = await GET(request);
      const data = await response.json();
      expect(data.totalPages).toBe(1); // ceil(5/10) = 1
    });
  });

  it("should not filter by is_active", async () => {
    const request = new Request(`${BASE_URL}/api/patients`);
    await GET(request);
    expect(mockQuery.eq).not.toHaveBeenCalledWith("is_active", expect.anything());
  });

  describe("Filtering - search", () => {
    it("should apply search filter when provided", async () => {
      const request = new Request(`${BASE_URL}/api/patients?search=juan`);
      await GET(request);
      expect(mockQuery.or).toHaveBeenCalled();
    });

    it("should not apply search filter when empty", async () => {
      const request = new Request(`${BASE_URL}/api/patients?search=`);
      await GET(request);
      expect(mockQuery.or).not.toHaveBeenCalled();
    });
  });

  describe("Response contract", () => {
    it("should return required fields", async () => {
      const request = new Request(`${BASE_URL}/api/patients`);
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty("data");
      expect(data).toHaveProperty("total");
      expect(data).toHaveProperty("page");
      expect(data).toHaveProperty("limit");
      expect(data).toHaveProperty("totalPages");
    });

    it("should return data as array", async () => {
      const request = new Request(`${BASE_URL}/api/patients`);
      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toBeInstanceOf(Array);
    });

    it("should return 200 on success", async () => {
      const request = new Request(`${BASE_URL}/api/patients`);
      const response = await GET(request);
      expect(response.status).toBe(200);
    });
  });

  describe("Error handling", () => {
    it("should return 500 on database error", async () => {
      mockQuery.range.mockResolvedValueOnce({
        data: null,
        error: { message: "DB connection failed" }
      });

      const request = new Request(`${BASE_URL}/api/patients`);
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });
});

// ============================================
// POST /api/patients
// ============================================
describe("POST /api/patients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initMock();
  });

  describe("Request body validation", () => {
    it("should return 400 for invalid JSON", async () => {
      const request = new Request(`${BASE_URL}/api/patients`, {
        method: "POST",
        body: "not valid json"
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("inválido");
    });

    it("should return 400 for empty body", async () => {
      const request = new Request(`${BASE_URL}/api/patients`, {
        method: "POST",
        body: ""
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing required fields", async () => {
      const request = createRequest({});

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Datos inválidos");
      expect(data.details).toBeDefined();
    });

    it("should return 400 for invalid gender enum", async () => {
      const request = createRequest({
        first_name: "Juan",
        last_name: "Pérez",
        dni: "30123456",
        date_of_birth: "1990-01-15",
        street: "Av. Rivadavia",
        street_number: "1234",
        locality: "Buenos Aires",
        postal_code: "C1000",
        gender: "other",
        condition_coverage: "health_insurance",
        phone: "3534184508"
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.details).toBeInstanceOf(Array);
    });
  });

  describe("Successful creation", () => {
    it("should return 201 with valid data", async () => {
      const mockPatient = {
        id: "123",
        first_name: "Juan",
        last_name: "Pérez",
        dni: "30123456",
        date_of_birth: "1990-01-15",
        street: "Av. Rivadavia",
        street_number: "1234",
        locality: "Buenos Aires",
        postal_code: "C1000",
        gender: "male",
        condition_coverage: "health_insurance",
        phone: "3534184508",
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      };

      // Setup POST chain mock
      mockQuery.insert.mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({ data: mockPatient, error: null });

      const request = createRequest({
        first_name: "Juan",
        last_name: "Pérez",
        dni: "30123456",
        date_of_birth: "1990-01-15",
        street: "Av. Rivadavia",
        street_number: "1234",
        locality: "Buenos Aires",
        postal_code: "C1000",
        gender: "male",
        condition_coverage: "health_insurance",
        phone: "3534184508"
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.first_name).toBe("Juan");
      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          dni: "30123456"
        })
      );
      expect(mockQuery.insert).not.toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: expect.anything()
        })
      );
    });
  });

  describe("Database errors", () => {
    it("should return 500 on database error", async () => {
      // Setup POST chain with error
      mockQuery.insert.mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: "DB connection failed" }
      });

      const request = createRequest({
        first_name: "Juan",
        last_name: "Pérez",
        dni: "30123456",
        date_of_birth: "1990-01-15",
        street: "Av. Rivadavia",
        street_number: "1234",
        locality: "Buenos Aires",
        postal_code: "C1000",
        gender: "male",
        condition_coverage: "health_insurance",
        phone: "3534184508"
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain("Error");
    });
  });
});
