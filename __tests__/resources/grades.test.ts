import { describe, it, expect, vi } from "vitest";
import { StudyPlug } from "../../src/client.js";

function createMockFetch(responseData: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers(),
    json: () => Promise.resolve(responseData),
  });
}

describe("GradesResource", () => {
  it("list() calls GET /api/v1/grades", async () => {
    const mockData = {
      data: {
        grades: [
          { slug: "kindergarten", name: "Kindergarten", order: 0, subjectCount: 5, skillCount: 42 },
          { slug: "grade-1", name: "Grade 1", order: 1, subjectCount: 5, skillCount: 58 },
        ],
      },
      meta: {
        requestId: "abc",
        generatedAt: "2026-01-01T00:00:00Z",
        apiVersion: "v1",
        cacheHit: false,
      },
    };
    const fetchFn = createMockFetch(mockData);
    const sp = new StudyPlug({ baseUrl: "http://localhost:3001", fetch: fetchFn });

    const result = await sp.grades.list();

    expect(result.data.grades).toHaveLength(2);
    expect(result.data.grades[0].slug).toBe("kindergarten");
    const [url] = fetchFn.mock.calls[0];
    expect(url).toBe("http://localhost:3001/api/v1/grades");
  });

  it("get() calls GET /api/v1/grades/:slug", async () => {
    const mockData = {
      data: {
        grade: {
          slug: "grade-3",
          name: "Grade 3",
          order: 3,
          subjects: [
            { slug: "math", name: "Math", topicCount: 4, skillCount: 20 },
          ],
        },
      },
      meta: {
        requestId: "abc",
        generatedAt: "2026-01-01T00:00:00Z",
        apiVersion: "v1",
        cacheHit: false,
      },
    };
    const fetchFn = createMockFetch(mockData);
    const sp = new StudyPlug({ baseUrl: "http://localhost:3001", fetch: fetchFn });

    const result = await sp.grades.get("grade-3");

    expect(result.data.grade.slug).toBe("grade-3");
    expect(result.data.grade.subjects).toHaveLength(1);
    const [url] = fetchFn.mock.calls[0];
    expect(url).toBe("http://localhost:3001/api/v1/grades/grade-3");
  });
});
