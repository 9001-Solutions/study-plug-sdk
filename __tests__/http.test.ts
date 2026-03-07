import { describe, it, expect, vi } from "vitest";
import { HttpClient } from "../src/http.js";
import { StudyPlugError, RateLimitError, NotFoundError, ValidationError } from "../src/errors.js";

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const headers = new Headers(response.headers);
  return vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    statusText: response.statusText ?? "OK",
    headers,
    json: response.json ?? (() => Promise.resolve({})),
  });
}

describe("HttpClient", () => {
  describe("URL building", () => {
    it("builds URL from baseUrl + path", async () => {
      const fetchFn = mockFetch({ json: () => Promise.resolve({ data: [] }) });
      const http = new HttpClient({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      await http.get("/api/v1/grades");

      expect(fetchFn).toHaveBeenCalledOnce();
      const url = fetchFn.mock.calls[0][0];
      expect(url).toBe("http://localhost:3001/api/v1/grades");
    });

    it("appends query params, skipping undefined/null", async () => {
      const fetchFn = mockFetch({ json: () => Promise.resolve({ data: [] }) });
      const http = new HttpClient({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      await http.get("/api/v1/skills", { grade: "grade-3", subject: undefined, page: 2 });

      const url = fetchFn.mock.calls[0][0];
      expect(url).toContain("grade=grade-3");
      expect(url).toContain("page=2");
      expect(url).not.toContain("subject");
    });

    it("strips trailing slash from baseUrl", async () => {
      const fetchFn = mockFetch({ json: () => Promise.resolve({}) });
      const http = new HttpClient({ baseUrl: "http://localhost:3001/", fetch: fetchFn });

      await http.get("/api/v1/grades");

      const url = fetchFn.mock.calls[0][0];
      expect(url).toBe("http://localhost:3001/api/v1/grades");
    });
  });

  describe("headers", () => {
    it("sets Accept header", async () => {
      const fetchFn = mockFetch({ json: () => Promise.resolve({}) });
      const http = new HttpClient({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      await http.get("/api/v1/grades");

      const init = fetchFn.mock.calls[0][1];
      expect(init.headers.Accept).toBe("application/json");
    });

    it("sets X-StudyPlug-Key when apiKey provided", async () => {
      const fetchFn = mockFetch({ json: () => Promise.resolve({}) });
      const http = new HttpClient({
        baseUrl: "http://localhost:3001",
        apiKey: "sk-test-key",
        fetch: fetchFn,
      });

      await http.get("/api/v1/grades");

      const init = fetchFn.mock.calls[0][1];
      expect(init.headers["X-StudyPlug-Key"]).toBe("sk-test-key");
    });

    it("does not set X-StudyPlug-Key when no apiKey", async () => {
      const fetchFn = mockFetch({ json: () => Promise.resolve({}) });
      const http = new HttpClient({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      await http.get("/api/v1/grades");

      const init = fetchFn.mock.calls[0][1];
      expect(init.headers["X-StudyPlug-Key"]).toBeUndefined();
    });

    it("sets Content-Type on POST", async () => {
      const fetchFn = mockFetch({ json: () => Promise.resolve({}) });
      const http = new HttpClient({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      await http.post("/api/v1/generate", { skill: "add-within-10" });

      const init = fetchFn.mock.calls[0][1];
      expect(init.headers["Content-Type"]).toBe("application/json");
    });
  });

  describe("error handling", () => {
    it("throws NotFoundError on 404", async () => {
      const fetchFn = mockFetch({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            type: "https://api.studyplug.org/errors/not-found",
            title: "Not Found",
            status: 404,
            detail: "No grade found with slug 'invalid'",
            instance: "/api/v1/grades/invalid",
          }),
      });
      const http = new HttpClient({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      await expect(http.get("/api/v1/grades/invalid")).rejects.toThrow(NotFoundError);
    });

    it("throws ValidationError on 422", async () => {
      const fetchFn = mockFetch({
        ok: false,
        status: 422,
        json: () =>
          Promise.resolve({
            type: "https://api.studyplug.org/errors/validation",
            title: "Validation Failed",
            status: 422,
            detail: "Missing required field",
            instance: "/api/v1/generate",
            errors: [{ field: "skill", message: "Required" }],
          }),
      });
      const http = new HttpClient({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      try {
        await http.post("/api/v1/generate", {});
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationError);
        expect((err as ValidationError).fieldErrors).toHaveLength(1);
      }
    });

    it("throws StudyPlugError on 500", async () => {
      const fetchFn = mockFetch({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            type: "https://api.studyplug.org/errors/internal",
            title: "Internal Error",
            status: 500,
            detail: "Something went wrong",
            instance: "/api/v1/generate",
          }),
      });
      const http = new HttpClient({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      await expect(http.post("/api/v1/generate", {})).rejects.toThrow(StudyPlugError);
    });

    it("handles non-JSON error responses", async () => {
      const fetchFn = mockFetch({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        json: () => Promise.reject(new Error("Not JSON")),
      });
      const http = new HttpClient({ baseUrl: "http://localhost:3001", fetch: fetchFn });

      try {
        await http.get("/api/v1/grades");
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(StudyPlugError);
        expect((err as StudyPlugError).status).toBe(502);
      }
    });
  });

  describe("retry on 429", () => {
    it("retries on 429 and succeeds", async () => {
      const rateLimitResponse = {
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        headers: new Headers({ "Retry-After": "0" }),
        json: () =>
          Promise.resolve({
            type: "https://api.studyplug.org/errors/rate-limited",
            title: "Rate Limited",
            status: 429,
            detail: "Too many requests",
            instance: "/api/v1/grades",
            retryAfter: 0,
          }),
      };
      const successResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        json: () => Promise.resolve({ data: { grades: [] } }),
      };

      const fetchFn = vi
        .fn()
        .mockResolvedValueOnce(rateLimitResponse)
        .mockResolvedValueOnce(successResponse);

      const http = new HttpClient({ baseUrl: "http://localhost:3001", fetch: fetchFn });
      const result = await http.get("/api/v1/grades");

      expect(fetchFn).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ data: { grades: [] } });
    });

    it("throws RateLimitError after max retries", async () => {
      const rateLimitResponse = {
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        headers: new Headers({ "Retry-After": "0" }),
        json: () =>
          Promise.resolve({
            type: "https://api.studyplug.org/errors/rate-limited",
            title: "Rate Limited",
            status: 429,
            detail: "Too many requests",
            instance: "/api/v1/grades",
            retryAfter: 0,
          }),
      };

      const fetchFn = vi.fn().mockResolvedValue(rateLimitResponse);

      const http = new HttpClient({
        baseUrl: "http://localhost:3001",
        fetch: fetchFn,
        maxRetries: 2,
      });

      await expect(http.get("/api/v1/grades")).rejects.toThrow(RateLimitError);
      // Initial + 2 retries = 3 calls
      expect(fetchFn).toHaveBeenCalledTimes(3);
    });
  });

  describe("timeout", () => {
    it("throws on timeout", async () => {
      const fetchFn = vi.fn().mockImplementation(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => {
              reject(new DOMException("Aborted", "AbortError"));
            });
          }),
      );

      const http = new HttpClient({
        baseUrl: "http://localhost:3001",
        fetch: fetchFn,
        timeout: 10,
      });

      try {
        await http.get("/api/v1/grades");
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(StudyPlugError);
        expect((err as StudyPlugError).raw.title).toBe("Request Timeout");
      }
    });
  });
});
