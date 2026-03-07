import type { HttpClient } from "../http.js";
import type { ApiResponse } from "../types/envelope.js";
import type { SkillSummary, SkillDetail, SkillsListParams } from "../types/catalog.js";

export class SkillsResource {
  constructor(private readonly http: HttpClient) {}

  /** Search/filter skills with pagination. */
  async list(
    params?: SkillsListParams,
  ): Promise<ApiResponse<{ skills: SkillSummary[] }>> {
    return this.http.get("/api/v1/skills", params as Record<string, unknown>);
  }

  /** Get a skill by slug with standards and available grades. */
  async get(slug: string): Promise<ApiResponse<SkillDetail>> {
    return this.http.get(`/api/v1/skills/${encodeURIComponent(slug)}`);
  }
}
