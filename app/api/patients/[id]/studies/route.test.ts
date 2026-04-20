import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

type MockQuery = ReturnType<typeof vi.fn> & {
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
};

const mockQuery = vi.fn() as MockQuery;
const mockUpload = vi.fn();
const mockCreateSignedUrl = vi.fn();
const mockRemove = vi.fn();
const mockStorageFrom = vi.fn();
let insertedStudyRow: Record<string, unknown> | undefined;

const initMock = () => {
  (mockQuery as unknown as Record<string, unknown>).from = vi.fn(() => mockQuery);
  mockQuery.select = vi.fn(() => mockQuery);
  mockQuery.eq = vi.fn(() => mockQuery);
  mockQuery.order = vi.fn();
  insertedStudyRow = undefined;
  mockQuery.insert = vi.fn((row: Record<string, unknown>) => {
    insertedStudyRow = row;
    return mockQuery;
  });
  mockQuery.single = vi.fn();

  mockUpload.mockReset();
  mockCreateSignedUrl.mockReset();
  mockRemove.mockReset();
  mockStorageFrom.mockReset();

  mockStorageFrom.mockReturnValue({
    upload: mockUpload,
    createSignedUrl: mockCreateSignedUrl,
    remove: mockRemove,
  });
};

initMock();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockQuery.from.mockReturnValue(mockQuery),
    storage: {
      from: mockStorageFrom,
    },
  })),
}));

const BASE_URL = "http://localhost:3000";
const validUUID = "12345678-1234-1234-1234-123456789012";
const today = new Date().toISOString().split("T")[0];

function createMultipartRequest(path: string, formData: FormData) {
  return new Request(`${BASE_URL}${path}`, {
    method: "POST",
    body: formData,
  });
}

describe("GET /api/patients/[id]/studies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initMock();
  });

  it("returns 400 when UUID is invalid", async () => {
    const response = await GET(new Request(`${BASE_URL}/api/patients/nope/studies`), {
      params: Promise.resolve({ id: "nope" }),
    });

    expect(response.status).toBe(400);
  });

  it("returns 404 when patient does not exist", async () => {
    mockQuery.single.mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } });

    const response = await GET(
      new Request(`${BASE_URL}/api/patients/${validUUID}/studies`),
      { params: Promise.resolve({ id: validUUID }) }
    );

    expect(response.status).toBe(404);
  });

  it("lists studies with preview_url", async () => {
    mockQuery.single.mockResolvedValueOnce({ data: { id: validUUID }, error: null });

    mockQuery.order.mockResolvedValueOnce({
      data: [
        {
          id: "study-1",
          patient_id: validUUID,
          type: "radiography",
          study_date: today,
          file_url: `patient-${validUUID}-studies/file-1.jpg`,
          created_at: "2026-04-20T10:00:00.000Z",
          updated_at: "2026-04-20T10:00:00.000Z",
        },
      ],
      error: null,
    });

    mockCreateSignedUrl.mockResolvedValueOnce({
      data: { signedUrl: "https://signed-url/file-1" },
      error: null,
    });

    const response = await GET(
      new Request(`${BASE_URL}/api/patients/${validUUID}/studies`),
      { params: Promise.resolve({ id: validUUID }) }
    );

    expect(response.status).toBe(200);
    expect(mockQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });

    const payload = await response.json();
    expect(payload[0].preview_url).toBe("https://signed-url/file-1");
  });
});

describe("POST /api/patients/[id]/studies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initMock();
  });

  it("returns 400 when UUID is invalid", async () => {
    const formData = new FormData();
    const response = await POST(createMultipartRequest("/api/patients/nope/studies", formData), {
      params: Promise.resolve({ id: "nope" }),
    });

    expect(response.status).toBe(400);
  });

  it("returns 400 when study_date is in the future", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formData = new FormData();
    formData.set("type", "radiography");
    formData.set("study_date", tomorrow.toISOString().split("T")[0]);
    formData.set("file", new File(["img"], "study.jpg", { type: "image/jpeg" }));

    const response = await POST(
      createMultipartRequest(`/api/patients/${validUUID}/studies`, formData),
      { params: Promise.resolve({ id: validUUID }) }
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when mime type is not allowed", async () => {
    const formData = new FormData();
    formData.set("type", "radiography");
    formData.set("study_date", today);
    formData.set("file", new File(["pdf"], "study.pdf", { type: "application/pdf" }));

    const response = await POST(
      createMultipartRequest(`/api/patients/${validUUID}/studies`, formData),
      { params: Promise.resolve({ id: validUUID }) }
    );

    expect(response.status).toBe(400);
  });

  it("returns 404 when patient does not exist", async () => {
    const formData = new FormData();
    formData.set("type", "tomography");
    formData.set("study_date", today);
    formData.set("file", new File(["img"], "study.png", { type: "image/png" }));

    mockQuery.single.mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } });

    const response = await POST(
      createMultipartRequest(`/api/patients/${validUUID}/studies`, formData),
      { params: Promise.resolve({ id: validUUID }) }
    );

    expect(response.status).toBe(404);
  });

  it("uploads file, persists file_url (storage path), and creates study", async () => {
    const formData = new FormData();
    formData.set("type", "radiography");
    formData.set("study_date", today);
    formData.set("file", new File(["image"], "study.jpg", { type: "image/jpeg" }));

    mockQuery.single
      .mockResolvedValueOnce({ data: { id: validUUID }, error: null })
      .mockImplementationOnce(async () => ({
        data: {
          id: "study-1",
          patient_id: validUUID,
          type: "radiography",
          study_date: today,
          file_url: insertedStudyRow?.file_url,
          created_at: "2026-04-20T10:00:00.000Z",
          updated_at: "2026-04-20T10:00:00.000Z",
        },
        error: null,
      }));

    mockUpload.mockResolvedValueOnce({ data: { path: "some-path" }, error: null });

    mockCreateSignedUrl.mockResolvedValueOnce({
      data: { signedUrl: "https://signed-url/file" },
      error: null,
    });

    const response = await POST(
      createMultipartRequest(`/api/patients/${validUUID}/studies`, formData),
      { params: Promise.resolve({ id: validUUID }) }
    );

    expect(response.status).toBe(201);

    const uploadPath = mockUpload.mock.calls[0]?.[0] as string;
    expect(uploadPath).toContain(`patient-${validUUID}-studies/`);
    expect(uploadPath.endsWith(".jpg")).toBe(true);

    expect(mockQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        patient_id: validUUID,
        type: "radiography",
        study_date: today,
        file_url: uploadPath,
      })
    );

    const payload = await response.json();
    expect(payload.file_url).toBe(uploadPath);
    expect(payload.preview_url).toBe("https://signed-url/file");
  });
});
