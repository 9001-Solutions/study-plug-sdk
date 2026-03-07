import type { HttpClient } from "../http.js";
import type { ApiResponse } from "../types/envelope.js";
import type { SubjectSummary, SubjectDetail } from "../types/catalog.js";

export class SubjectsResource {
  constructor(private readonly http: HttpClient) {}

  /** List all subjects. */
  async list(): Promise<ApiResponse<{ subjects: SubjectSummary[] }>> {
    return this.http.get("/api/v1/subjects");
  }

  /** Get a subject by slug with its topics. */
  async get(
    slug: string,
  ): Promise<ApiResponse<{ subject: SubjectDetail }>> {
    return this.http.get(`/api/v1/subjects/${encodeURIComponent(slug)}`);
  }
}
