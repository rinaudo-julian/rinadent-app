import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";

type MockQuery = ReturnType<typeof vi.fn> & {
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
};

// Create flexible mock
const mockQuery = vi.fn() as MockQuery;

const initMock = () => {
  (mockQuery as unknown as Record<string, unknown>).from = vi.fn(
    () => mockQuery
  );
  mockQuery.select = vi.fn(() => mockQuery);
  mockQuery.eq = vi.fn(() => mockQuery);
  mockQuery.insert = vi.fn(() => mockQuery);
  mockQuery.single = vi.fn();
  mockQuery.maybeSingle = vi.fn();
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
const validUUID = "12345678-1234-1234-1234-123456789012";

function createRequest(path: string, body?: unknown, method = "POST") {
  return new Request(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
}

// ============================================
// GET /api/patients/[id]/medical-history
// ============================================
describe("GET /api/patients/[id]/medical-history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initMock();
  });

  describe("ID validation", () => {
    it("should return 400 for invalid UUID format", async () => {
      const request = createRequest("/api/patients/not-a-uuid/medical-history", null, "GET");
      const response = await GET(request, { params: Promise.resolve({ id: "not-a-uuid" }) });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("inválido");
    });
  });

  describe("Successful fetch", () => {
    it("should return medical history when exists", async () => {
      const mockMedicalHistory = {
        id: validUUID,
        patient_id: validUUID,
        allergies: 0,
        heart_condition: 0,
        diabetes: 0,
        hypertension: 0,
        anticoagulation: 0,
        bisphosphonates: 0,
        osteoporosis: 0,
        hemophilia: 0,
        covid: 0,
        covid_observation: null,
        bone_density_studies: 0,
        medications: null,
        oncological_treatment: "none",
        previous_lab_results: "none",
        current_lab_results: "none",
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      };

      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: mockMedicalHistory,
        error: null
      });

      const request = createRequest(`/api/patients/${validUUID}/medical-history`, null, "GET");
      const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.allergies).toBe(0);
      expect(data.oncological_treatment).toBe("none");
    });

    it("should return null when no medical history exists", async () => {
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const request = createRequest(`/api/patients/${validUUID}/medical-history`, null, "GET");
      const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toBeNull();
    });
  });

  describe("Error handling", () => {
    it("should return 500 on database error", async () => {
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Connection failed" }
      });

      const request = createRequest(`/api/patients/${validUUID}/medical-history`, null, "GET");
      const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(500);
    });
  });
});

// ============================================
// POST /api/patients/[id]/medical-history
// ============================================
describe("POST /api/patients/[id]/medical-history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initMock();
  });

  describe("ID validation", () => {
    it("should return 400 for invalid UUID format", async () => {
      const request = createRequest("/api/patients/not-a-uuid/medical-history", {});
      const response = await POST(request, { params: Promise.resolve({ id: "not-a-uuid" }) });
      
      expect(response.status).toBe(400);
    });
  });

  describe("Patient validation", () => {
    it("should return 404 when patient not found", async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" }
      });

      const request = createRequest(`/api/patients/${validUUID}/medical-history`, {
        allergies: 0,
        heart_condition: 0,
        diabetes: 0,
        hypertension: 0,
        anticoagulation: 0,
        bisphosphonates: 0,
        osteoporosis: 0,
        hemophilia: 0,
        covid: 0,
        bone_density_studies: 0,
        oncological_treatment: "none",
        previous_lab_results: "none",
        current_lab_results: "none"
      });

      const response = await POST(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toContain("no encontrado");
    });

    it("should return 400 when medical history already exists", async () => {
      // First call - patient exists
      mockQuery.single.mockResolvedValueOnce({
        data: { id: validUUID },
        error: null
      });
      // Second call - check existing
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: { id: "existing-history-id" },
        error: null
      });

      const request = createRequest(`/api/patients/${validUUID}/medical-history`, {
        allergies: 0,
        heart_condition: 0,
        diabetes: 0,
        hypertension: 0,
        anticoagulation: 0,
        bisphosphonates: 0,
        osteoporosis: 0,
        hemophilia: 0,
        covid: 0,
        bone_density_studies: 0,
        oncological_treatment: "none",
        previous_lab_results: "none",
        current_lab_results: "none"
      });

      const response = await POST(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("ya tiene");
    });
  });

  describe("Request body validation", () => {
    it("should return 400 for invalid JSON", async () => {
      // Mock patient exists
      mockQuery.single.mockResolvedValueOnce({
        data: { id: validUUID },
        error: null
      });
      // No existing history
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const request = new Request(`${BASE_URL}/api/patients/${validUUID}/medical-history`, {
        method: "POST",
        body: "not valid json"
      });

      const response = await POST(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(400);
    });

    it("should return 400 for missing required fields", async () => {
      // Mock patient exists
      mockQuery.single.mockResolvedValueOnce({
        data: { id: validUUID },
        error: null
      });
      // No existing history
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const request = createRequest(`/api/patients/${validUUID}/medical-history`, {});
      const response = await POST(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Datos inválidos");
    });

    it("should return 400 for invalid boolean values", async () => {
      // Mock patient exists
      mockQuery.single.mockResolvedValueOnce({
        data: { id: validUUID },
        error: null
      });
      // No existing history
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const request = createRequest(`/api/patients/${validUUID}/medical-history`, {
        allergies: 2, // Invalid - must be 0 or 1
        heart_condition: 0,
        diabetes: 0,
        hypertension: 0,
        anticoagulation: 0,
        bisphosphonates: 0,
        osteoporosis: 0,
        hemophilia: 0,
        covid: 0,
        bone_density_studies: 0,
        oncological_treatment: "none",
        previous_lab_results: "none",
        current_lab_results: "none"
      });

      const response = await POST(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid enum values", async () => {
      // Mock patient exists
      mockQuery.single.mockResolvedValueOnce({
        data: { id: validUUID },
        error: null
      });
      // No existing history
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const request = createRequest(`/api/patients/${validUUID}/medical-history`, {
        allergies: 0,
        heart_condition: 0,
        diabetes: 0,
        hypertension: 0,
        anticoagulation: 0,
        bisphosphonates: 0,
        osteoporosis: 0,
        hemophilia: 0,
        covid: 0,
        bone_density_studies: 0,
        oncological_treatment: "invalid", // Invalid enum
        previous_lab_results: "none",
        current_lab_results: "none"
      });

      const response = await POST(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(400);
    });
  });

  describe("Successful creation", () => {
    it("should return 201 with valid data", async () => {
      // Mock patient exists
      mockQuery.single.mockResolvedValueOnce({
        data: { id: validUUID },
        error: null
      });
      // No existing history
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });
      // Insert success
      mockQuery.insert.mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValueOnce({
        data: {
          id: validUUID,
          patient_id: validUUID,
          allergies: 0,
          heart_condition: 0,
          diabetes: 0,
          hypertension: 0,
          anticoagulation: 0,
          bisphosphonates: 0,
          osteoporosis: 0,
          hemophilia: 0,
          covid: 0,
          covid_observation: null,
          bone_density_studies: 0,
          medications: null,
          oncological_treatment: "none",
          previous_lab_results: "none",
          current_lab_results: "none",
          created_at: "2024-01-01",
          updated_at: "2024-01-01"
        },
        error: null
      });

      const request = createRequest(`/api/patients/${validUUID}/medical-history`, {
        allergies: 0,
        heart_condition: 0,
        diabetes: 0,
        hypertension: 0,
        anticoagulation: 0,
        bisphosphonates: 0,
        osteoporosis: 0,
        hemophilia: 0,
        covid: 0,
        bone_density_studies: 0,
        oncological_treatment: "none",
        previous_lab_results: "none",
        current_lab_results: "none"
      });

      const response = await POST(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.patient_id).toBe(validUUID);
    });
  });

  describe("Database errors", () => {
    it("should return 500 on database error during insert", async () => {
      // Mock patient exists
      mockQuery.single.mockResolvedValueOnce({
        data: { id: validUUID },
        error: null
      });
      // No existing history
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });
      // Insert error
      mockQuery.insert.mockReturnValue(mockQuery);
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { message: "DB error" }
      });

      const request = createRequest(`/api/patients/${validUUID}/medical-history`, {
        allergies: 0,
        heart_condition: 0,
        diabetes: 0,
        hypertension: 0,
        anticoagulation: 0,
        bisphosphonates: 0,
        osteoporosis: 0,
        hemophilia: 0,
        covid: 0,
        bone_density_studies: 0,
        oncological_treatment: "none",
        previous_lab_results: "none",
        current_lab_results: "none"
      });

      const response = await POST(request, { params: Promise.resolve({ id: validUUID }) });
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain("Error");
    });
  });
});