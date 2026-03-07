import { describe, it, expect, vi } from "vitest";
import { StudyPlug } from "../src/client.js";

function createMockFetch(responseData: unknown = {}) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers(),
    json: () => Promise.resolve(responseData),
  });
}

describe("StudyPlug", () => {
  describe("constructor", () => {
    it("creates instance with default options", () => {
      const sp = new StudyPlug({ fetch: createMockFetch() });
      expect(sp).toBeInstanceOf(StudyPlug);
    });

    it("creates instance with custom options", () => {
      const sp = new StudyPlug({
        apiKey: "sk-test",
        baseUrl: "http://localhost:3001",
        timeout: 5000,
        fetch: createMockFetch(),
      });
      expect(sp).toBeInstanceOf(StudyPlug);
    });
  });

  describe("resource accessors", () => {
    it("exposes grades resource", () => {
      const sp = new StudyPlug({ fetch: createMockFetch() });
      expect(sp.grades).toBeDefined();
      expect(sp.grades.list).toBeTypeOf("function");
      expect(sp.grades.get).toBeTypeOf("function");
    });

    it("exposes subjects resource", () => {
      const sp = new StudyPlug({ fetch: createMockFetch() });
      expect(sp.subjects).toBeDefined();
      expect(sp.subjects.list).toBeTypeOf("function");
      expect(sp.subjects.get).toBeTypeOf("function");
    });

    it("exposes topics resource", () => {
      const sp = new StudyPlug({ fetch: createMockFetch() });
      expect(sp.topics).toBeDefined();
      expect(sp.topics.list).toBeTypeOf("function");
    });

    it("exposes skills resource", () => {
      const sp = new StudyPlug({ fetch: createMockFetch() });
      expect(sp.skills).toBeDefined();
      expect(sp.skills.list).toBeTypeOf("function");
      expect(sp.skills.get).toBeTypeOf("function");
    });

    it("exposes standards resource", () => {
      const sp = new StudyPlug({ fetch: createMockFetch() });
      expect(sp.standards).toBeDefined();
      expect(sp.standards.list).toBeTypeOf("function");
      expect(sp.standards.get).toBeTypeOf("function");
    });
  });

  describe("generate", () => {
    it("generate() is callable for batch generation", async () => {
      const mockResponse = {
        data: { items: [], answerKey: [] },
        meta: {
          requestId: "test",
          generatedAt: "2026-01-01T00:00:00Z",
          apiVersion: "v1",
          cacheHit: false,
        },
      };
      const fetchFn = createMockFetch(mockResponse);
      const sp = new StudyPlug({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      const result = await sp.generate({ skill: "add-within-10", count: 5 });

      expect(result).toEqual(mockResponse);
      expect(fetchFn).toHaveBeenCalledOnce();
      const [url, init] = fetchFn.mock.calls[0];
      expect(url).toBe("http://localhost:3001/api/v1/generate");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body)).toEqual({ skill: "add-within-10", count: 5 });
    });

    it("generate.single() works for single generation", async () => {
      const mockResponse = {
        data: {
          item: { id: "test", type: "arithmetic", skill: "add-within-10" },
          answer: { itemId: "test", answer: "5" },
        },
        meta: {
          requestId: "test",
          generatedAt: "2026-01-01T00:00:00Z",
          apiVersion: "v1",
          cacheHit: false,
        },
      };
      const fetchFn = createMockFetch(mockResponse);
      const sp = new StudyPlug({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      const result = await sp.generate.single({ skill: "add-within-10" });

      expect(result).toEqual(mockResponse);
      const [url, init] = fetchFn.mock.calls[0];
      expect(url).toBe("http://localhost:3001/api/v1/generate/single");
      expect(JSON.parse(init.body)).toEqual({ skill: "add-within-10" });
    });
  });

  describe("health", () => {
    it("calls GET /health", async () => {
      const mockResponse = { status: "ok", timestamp: "2026-01-01T00:00:00Z", uptime: 42 };
      const fetchFn = createMockFetch(mockResponse);
      const sp = new StudyPlug({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      const result = await sp.health();

      expect(result).toEqual(mockResponse);
      const [url, init] = fetchFn.mock.calls[0];
      expect(url).toBe("http://localhost:3001/api/v1/health");
      expect(init.method).toBe("GET");
    });
  });
});
