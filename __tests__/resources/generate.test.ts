import { describe, it, expect, vi } from "vitest";
import { StudyPlug } from "../../src/client.js";
import { NotFoundError, ValidationError } from "../../src/errors.js";

function createMockFetch(responseData: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: new Headers(),
    json: () => Promise.resolve(responseData),
  });
}

describe("GenerateResource", () => {
  describe("batch (sp.generate())", () => {
    it("sends POST to /api/v1/generate with params", async () => {
      const mockData = {
        data: {
          items: [
            {
              id: "item-1",
              type: "arithmetic",
              skill: "add-within-10",
              gradeLevel: 0,
              content: { type: "arithmetic", operand1: 3, operand2: 5, operator: "+" },
              answer: { type: "exact", value: 8, display: "8" },
              difficulty: { level: "easy" },
            },
          ],
          answerKey: [{ itemId: "item-1", answer: "8" }],
        },
        meta: {
          requestId: "abc",
          generatedAt: "2026-01-01T00:00:00Z",
          apiVersion: "v1",
          cacheHit: false,
          seed: 42,
        },
      };
      const fetchFn = createMockFetch(mockData);
      const sp = new StudyPlug({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      const result = await sp.generate({ skill: "add-within-10", count: 1, seed: 42 });

      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].type).toBe("arithmetic");
      expect(result.meta.seed).toBe(42);

      const [url, init] = fetchFn.mock.calls[0];
      expect(url).toBe("http://localhost:3001/api/v1/generate");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body)).toEqual({ skill: "add-within-10", count: 1, seed: 42 });
    });

    it("supports multiple skills", async () => {
      const mockData = {
        data: { items: [], answerKey: [] },
        meta: { requestId: "abc", generatedAt: "2026-01-01T00:00:00Z", apiVersion: "v1", cacheHit: false },
      };
      const fetchFn = createMockFetch(mockData);
      const sp = new StudyPlug({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      await sp.generate({ skills: ["add-within-10", "subtract-within-10"], count: 4 });

      const body = JSON.parse(fetchFn.mock.calls[0][1].body);
      expect(body.skills).toEqual(["add-within-10", "subtract-within-10"]);
      expect(body.count).toBe(4);
    });
  });

  describe("single (sp.generate.single())", () => {
    it("sends POST to /api/v1/generate/single", async () => {
      const mockData = {
        data: {
          item: {
            id: "item-1",
            type: "arithmetic",
            skill: "add-within-10",
            gradeLevel: 0,
            content: { type: "arithmetic", operand1: 2, operand2: 3, operator: "+" },
            answer: { type: "exact", value: 5, display: "5" },
            difficulty: { level: "easy" },
          },
          answer: { itemId: "item-1", answer: "5" },
        },
        meta: { requestId: "abc", generatedAt: "2026-01-01T00:00:00Z", apiVersion: "v1", cacheHit: false },
      };
      const fetchFn = createMockFetch(mockData);
      const sp = new StudyPlug({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      const result = await sp.generate.single({ skill: "add-within-10" });

      expect(result.data.item.type).toBe("arithmetic");
      expect(result.data.answer.answer).toBe("5");

      const [url, init] = fetchFn.mock.calls[0];
      expect(url).toBe("http://localhost:3001/api/v1/generate/single");
      expect(JSON.parse(init.body)).toEqual({ skill: "add-within-10" });
    });
  });

  describe("error cases", () => {
    it("throws NotFoundError when skill doesn't exist", async () => {
      const fetchFn = createMockFetch(
        {
          type: "https://api.studyplug.org/errors/not-found",
          title: "Skill Not Found",
          status: 404,
          detail: "No skill found with slug 'nonexistent'",
          instance: "/api/v1/generate/single",
        },
        404,
      );
      const sp = new StudyPlug({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      await expect(sp.generate.single({ skill: "nonexistent" })).rejects.toThrow(NotFoundError);
    });

    it("throws ValidationError on missing required fields", async () => {
      const fetchFn = createMockFetch(
        {
          type: "https://api.studyplug.org/errors/validation",
          title: "Missing Required Field",
          status: 422,
          detail: "At least one of 'skill', 'skills', 'standard', 'standards', or 'subject' is required",
          instance: "/api/v1/generate",
        },
        422,
      );
      const sp = new StudyPlug({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      await expect(sp.generate({ count: 5 })).rejects.toThrow(ValidationError);
    });
  });
});
