import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

type MockQuery = ReturnType<typeof vi.fn> & {
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
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

function createGetRequest(path: string) {
  return new Request(`${BASE_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
}

// ============================================
// GET /api/patients/[id]
// ============================================
describe("GET /api/patients/[id]", () => {
  const validUUID = "12345678-1234-1234-1234-123456789012";

  beforeEach(() => {
    vi.clearAllMocks();
    initMock();
  });

  describe("ID validation", () => {
    it("should return 400 for invalid UUID format", async () => {
      const request = createGetRequest("/api/patients/not-a-uuid");
      const response = await GET(request, { params: Promise.resolve({ id: "not-a-uuid" }) });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("inválido");
    });

    it("should return 400 for malformed UUID", async () => {
      const request = createGetRequest("/api/patients/12345");
      const response = await GET(request, { params: Promise.resolve({ id: "12345" }) });
      
      expect(response.status).toBe(400);
    });

    it("should accept valid UUID", async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" } // No rows
      });

      const request = createGetRequest(`/api/patients/${validUUID}`);
      const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).not.toBe(400);
    });
  });

  describe("Successful fetch", () => {
    it("should return patient data for valid ID", async () => {
      const mockPatient = {
        id: validUUID,
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

      mockQuery.single.mockResolvedValueOnce({
        data: mockPatient,
        error: null
      });

      const request = createGetRequest(`/api/patients/${validUUID}`);
      const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.first_name).toBe("Juan");
      expect(data.last_name).toBe("Pérez");
    });

    it("should query with correct filters", async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" }
      });

      const request = createGetRequest(`/api/patients/${validUUID}`);
      await GET(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(mockQuery.eq).toHaveBeenCalledWith("id", validUUID);
    });
  });

  describe("Not found cases", () => {
    it("should return 404 when patient not found", async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" } // PGRST116 = no rows returned
      });

      const request = createGetRequest(`/api/patients/${validUUID}`);
      const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toContain("no encontrado");
    });
  });

  describe("Error handling", () => {
    it("should return 500 on database error", async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Connection failed", code: "PGRST100" }
      });

      const request = createGetRequest(`/api/patients/${validUUID}`);
      const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain("Error");
    });
  });
});
