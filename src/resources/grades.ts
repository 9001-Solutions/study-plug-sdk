import type { HttpClient } from "../http.js";
import type { ApiResponse } from "../types/envelope.js";
import type { GradeSummary, GradeDetail } from "../types/catalog.js";

export class GradesResource {
  constructor(private readonly http: HttpClient) {}

  /** List all grade levels. */
  async list(): Promise<ApiResponse<{ grades: GradeSummary[] }>> {
    return this.http.get("/api/v1/grades");
  }

  /** Get a grade by slug with its subjects. */
  async get(
    slug: string,
  ): Promise<ApiResponse<{ grade: GradeDetail }>> {
    return this.http.get(`/api/v1/grades/${encodeURIComponent(slug)}`);
  }
}
